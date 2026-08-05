# Service Catalog Design

How this extension models Google Cloud console services and resources,
and how the model connects URL detection, visit history, and omnibox search.

Goal: jump to the resource you have in mind by typing a few tokens into the
omnibox (keyword `g`).

## Model

Three levels, all declared as data in `src/services/` (one file per service):

- **Service** (`ServiceDef`) — a Google Cloud product. e.g. Cloud Run.
- **Page** (`PageDef`) — a console destination within a service.
  e.g. the Cloud Run service list.
- **Resource page** — a `PageDef` with a `resource` field: a page whose URL
  contains identifiers of a concrete resource. e.g. a Cloud Run service
  detail page. A recorded visit (`PageHit` = pageId + captured params +
  project) represents a resource instance.

The catalog does not aim to cover every console page. It covers frequently
used pages and clearly resource-shaped ones; everything else simply is not
suggested.

## Bidirectional URL patterns

Each page declares a single `pattern` (URLPattern pathname syntax) that
drives both directions, implemented in `src/catalog.ts`:

- **Detection** — `matchUrl(services, url)` finds the most specific matching
  page and captures `:param` values. Deeper subpaths (detail-page tabs like
  `/metrics`) match implicitly. Pages identified by query params declare
  `query` (e.g. `{serviceId: ':service'}`).
- **Generation** — `buildUrl(services, hit)` fills the same pattern with
  params and appends `?project=` to produce the jump destination.

Because one declaration serves both, a catalog entry can never detect a URL
it cannot rebuild. `examples` (real console URLs) on each page are verified
by `src/services/services.test.ts`, including a
`matchUrl -> buildUrl -> matchUrl` round-trip for resource pages.

## Visit history

`src/visits.ts` stores a single visit log in `chrome.storage.local`:

- A visit is `{pageId, params, project, visitCount, lastVisitedAt}` —
  stable IDs and params only, never paths or display names. Console URL
  changes are fixed by updating the catalog; history heals with it.
  Visits whose `pageId` no longer exists are silently ignored.
- Ranking uses **frecency**: `visitCount` decayed with a 30-day half-life.
- Projects are tracked the same way, derived from every recorded URL.
- `schemaVersion` gates migration (v2 seeds projects from the legacy
  `storage.sync` data).

## Recording pipeline

```
webNavigation (onCompleted / onHistoryStateUpdated, console host only)
  -> matchUrl                    // same catalog as search
  -> VisitStore.record(hit)      // upsert, frecency prune
  -> (no page match, but ?project=) VisitStore.recordProject(project)
```

`onHistoryStateUpdated` catches the console's SPA navigations that a plain
page-load listener would miss.

## Search

`src/search.ts` ranks two candidate sources with one scoring function:

1. **Visited** — resolved visits; matches on resource name, page/service
   name, service and page `aliases`, and project. Boosted by the visit's
   frecency.
2. **Catalog x recent projects** — param-free pages paired with the top
   projects, so unvisited pages are still reachable. Weakly boosted by
   project frecency.

Every token must match some field (AND). Resource-name matches weigh most
(prefix > substring), then names/aliases, then project. Results are deduped
by URL and capped at 8. Empty input lists visited entries by frecency.

## Adding a service

See the doc comment in `src/services/index.ts`. In short: add
`src/services/<id>.ts`, register it in `index.ts`, write `examples`, run
`pnpm test`. Conventions:

- `ServiceDef.id` and `PageDef.id` (`<serviceId>.<key>`) are referenced by
  stored history — never change them once released.
- `aliases` on a service (`gcs`, `bq`) or a page (`sa`, `topic`) add search
  keywords not contained in the display names.
- Names follow the console's own notation.

Consistency (unique IDs, pattern validity, `resource.nameParam` coverage,
example resolution and round-trips) is enforced by tests, so a data-only PR
that passes CI is safe to accept.
