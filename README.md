chrome-jaunte-gcp-console
===

An unofficial Chrome extension to "jaunte" (teleport) around Google Cloud
console pages from the omnibox.

Type <kbd>g</kbd> + <kbd>Space</kbd> in the address bar, then a few tokens —
a resource name, a service abbreviation like `gcs`, a project ID — and jump
straight to the page you have in mind. Narrow down with explicit filters:
`s:run api` (service) or `p:my-proj log` (project).

## How it works

The extension records the console pages and resources you visit (locally,
in `chrome.storage.local`) and ranks suggestions by frecency, combined with
a hand-maintained catalog of services and URL patterns in `src/services/`.

See [docs/service-catalog-design.md](docs/service-catalog-design.md) for the
design of the catalog, visit history, and search.

## Install

Build from source and load it as an unpacked extension:

```console
$ pnpm install
$ pnpm run build
```

Then open `chrome://extensions`, enable Developer mode, and "Load unpacked"
the `build/` directory.

## Development

```console
$ pnpm run build:watch  # rebuild on change
$ pnpm test             # vitest + lint/format/typecheck
$ pnpm run fix          # auto-fix lint & formatting
```

## Adding a service to the catalog

Pull requests adding services or pages are welcome. Add a declarative
definition under `src/services/` and its `examples` are verified
automatically by tests — see the doc comment in
[src/services/index.ts](src/services/index.ts) and the
[design doc](docs/service-catalog-design.md#adding-a-service) for the steps
and conventions.
