import {buildUrl, findPage, patternParams, ServiceDef} from './catalog.ts';
import type {PageDef} from './catalog.ts';
import {frecency, VisitState} from './visits.ts';

export interface Candidate {
  url: string;
  service: ServiceDef;
  page: PageDef;
  project?: string;
  resourceName?: string;
  score: number;
}

const topProjectsCount = 5;
const maxResults = 8;

/** Pages that can be jumped to without any resource-specific param. */
function isParamFreePage(page: PageDef): boolean {
  if (patternParams(page.pattern).length > 0) return false;
  for (const value of Object.values(page.query || {})) {
    if (value.startsWith(':')) return false;
  }
  return true;
}

/**
 * Per-token match weight against a candidate's fields.
 * Returns the max weight across fields, or 0 if the token matches nothing.
 */
function tokenWeight(
  token: string,
  fields: {
    resourceName?: string;
    pageName: string;
    serviceName: string;
    aliases?: string[];
    pageAliases?: string[];
    project?: string;
  },
): number {
  let weight = 0;

  if (fields.resourceName) {
    const name = fields.resourceName.toLowerCase();
    if (name.startsWith(token)) weight = Math.max(weight, 5);
    else if (name.includes(token)) weight = Math.max(weight, 4);
  }

  if (fields.pageName.toLowerCase().includes(token))
    weight = Math.max(weight, 2);
  if (fields.serviceName.toLowerCase().includes(token))
    weight = Math.max(weight, 2);
  for (const alias of fields.aliases || []) {
    if (alias.toLowerCase().includes(token)) weight = Math.max(weight, 2);
  }
  for (const alias of fields.pageAliases || []) {
    if (alias.toLowerCase().includes(token)) weight = Math.max(weight, 2);
  }

  if (fields.project && fields.project.toLowerCase().includes(token)) {
    weight = Math.max(weight, 1);
  }

  return weight;
}

/** Sum of per-token max weights; undefined if any token fails to match (AND). */
function matchScore(
  tokens: string[],
  fields: {
    resourceName?: string;
    pageName: string;
    serviceName: string;
    aliases?: string[];
    pageAliases?: string[];
    project?: string;
  },
): number | undefined {
  let total = 0;
  for (const token of tokens) {
    const weight = tokenWeight(token, fields);
    if (weight === 0) return undefined;
    total += weight;
  }
  return total;
}

export function search(
  tokens: string[],
  services: ServiceDef[],
  state: VisitState,
  now: number,
): Candidate[] {
  const candidates: Candidate[] = [];

  if (tokens.length === 0) {
    // No tokens: list visited candidates by frecency.
    const sorted = [...state.visits].sort(
      (a, b) => frecency(b, now) - frecency(a, now),
    );
    for (const visit of sorted) {
      const found = findPage(services, visit.pageId);
      if (!found) continue;
      const url = buildUrl(services, visit);
      if (!url) continue;
      const {service, page} = found;
      const resourceName = page.resource
        ? visit.params[page.resource.nameParam]
        : undefined;
      candidates.push({
        url,
        service,
        page,
        project: visit.project,
        resourceName,
        score: frecency(visit, now),
      });
    }
  } else {
    // Visited candidates.
    for (const visit of state.visits) {
      const found = findPage(services, visit.pageId);
      if (!found) continue;
      const url = buildUrl(services, visit);
      if (!url) continue;
      const {service, page} = found;
      const resourceName = page.resource
        ? visit.params[page.resource.nameParam]
        : undefined;

      const matched = matchScore(tokens, {
        resourceName,
        pageName: page.name,
        serviceName: service.name,
        aliases: service.aliases,
        pageAliases: page.aliases,
        project: visit.project,
      });
      if (matched === undefined) continue;

      const score = matched * (1 + Math.log2(1 + frecency(visit, now)));
      candidates.push({
        url,
        service,
        page,
        project: visit.project,
        resourceName,
        score,
      });
    }

    // Catalog x project candidates.
    const topProjects = [...state.projects]
      .sort((a, b) => frecency(b, now) - frecency(a, now))
      .slice(0, topProjectsCount);

    for (const projectVisit of topProjects) {
      for (const service of services) {
        for (const page of service.pages) {
          if (!isParamFreePage(page)) continue;

          const matched = matchScore(tokens, {
            pageName: page.name,
            serviceName: service.name,
            aliases: service.aliases,
            pageAliases: page.aliases,
            project: projectVisit.project,
          });
          if (matched === undefined) continue;

          const url = buildUrl(services, {
            pageId: page.id,
            params: {},
            project: projectVisit.project,
          });
          if (!url) continue;

          const score =
            matched * (1 + Math.log2(1 + frecency(projectVisit, now) * 0.3));
          candidates.push({
            url,
            service,
            page,
            project: projectVisit.project,
            score,
          });
        }
      }
    }
  }

  // Dedupe by url, keeping the highest score.
  const byUrl = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const existing = byUrl.get(candidate.url);
    if (!existing || existing.score < candidate.score) {
      byUrl.set(candidate.url, candidate);
    }
  }

  return [...byUrl.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
