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

export interface Query {
  terms: string[];
  projectFilters: string[];
  serviceFilters: string[];
}

const topProjectsCount = 5;
const maxResults = 8;

const projectPrefixes = ['p:', 'project:'];
const servicePrefixes = ['s:', 'service:'];

/**
 * Split tokens into filter tokens (`p:`/`project:`/`s:`/`service:`) and
 * plain search terms. Tokens are expected to already be lower-cased.
 */
export function parseQuery(tokens: string[]): Query {
  const terms: string[] = [];
  const projectFilters: string[] = [];
  const serviceFilters: string[] = [];

  for (const token of tokens) {
    const projectPrefix = projectPrefixes.find(p => token.startsWith(p));
    if (projectPrefix) {
      const value = token.slice(projectPrefix.length);
      if (value.length > 0) projectFilters.push(value);
      continue;
    }

    const servicePrefix = servicePrefixes.find(p => token.startsWith(p));
    if (servicePrefix) {
      const value = token.slice(servicePrefix.length);
      if (value.length > 0) serviceFilters.push(value);
      continue;
    }

    terms.push(token);
  }

  return {terms, projectFilters, serviceFilters};
}

/** True if a service matches any of the given service filters (OR). */
function serviceMatchesFilters(
  service: ServiceDef,
  serviceFilters: string[],
): boolean {
  if (serviceFilters.length === 0) return true;
  return serviceFilters.some(filter => {
    if (service.id.toLowerCase().includes(filter)) return true;
    if (service.name.toLowerCase().includes(filter)) return true;
    return (service.aliases || []).some(alias =>
      alias.toLowerCase().includes(filter),
    );
  });
}

/** True if a project matches any of the given project filters (OR). */
function projectMatchesFilters(
  project: string | undefined,
  projectFilters: string[],
): boolean {
  if (projectFilters.length === 0) return true;
  if (!project) return false;
  const lower = project.toLowerCase();
  return projectFilters.some(filter => lower.includes(filter));
}

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
  query: Query,
  services: ServiceDef[],
  state: VisitState,
  now: number,
): Candidate[] {
  const {terms, projectFilters, serviceFilters} = query;
  const hasFilters = projectFilters.length > 0 || serviceFilters.length > 0;
  const candidates: Candidate[] = [];

  if (terms.length === 0 && !hasFilters) {
    // No tokens at all: list visited candidates by frecency.
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
      const {service, page} = found;

      if (!serviceMatchesFilters(service, serviceFilters)) continue;
      if (!projectMatchesFilters(visit.project, projectFilters)) continue;

      const url = buildUrl(services, visit);
      if (!url) continue;
      const resourceName = page.resource
        ? visit.params[page.resource.nameParam]
        : undefined;

      let matched: number | undefined;
      if (terms.length === 0) {
        // No search terms: filters alone gate inclusion, treat as matched.
        matched = 1;
      } else {
        matched = matchScore(terms, {
          resourceName,
          pageName: page.name,
          serviceName: service.name,
          aliases: service.aliases,
          pageAliases: page.aliases,
          project: visit.project,
        });
      }
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
    // With a project filter, search state.projects entirely (matching the
    // filter) instead of only the top N by frecency, so rarely-used
    // projects remain reachable.
    const projectCandidates =
      projectFilters.length > 0
        ? state.projects.filter(p =>
            projectMatchesFilters(p.project, projectFilters),
          )
        : [...state.projects]
            .sort((a, b) => frecency(b, now) - frecency(a, now))
            .slice(0, topProjectsCount);

    for (const projectVisit of projectCandidates) {
      for (const service of services) {
        if (!serviceMatchesFilters(service, serviceFilters)) continue;

        for (const page of service.pages) {
          if (!isParamFreePage(page)) continue;

          let matched: number | undefined;
          if (terms.length === 0) {
            matched = 1;
          } else {
            matched = matchScore(terms, {
              pageName: page.name,
              serviceName: service.name,
              aliases: service.aliases,
              pageAliases: page.aliases,
              project: projectVisit.project,
            });
          }
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
