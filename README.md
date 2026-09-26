# ASDL Docs

Source for **https://docs.asdl.website** — documentation for ASDL Hub, ASDL
Agent and related projects. Built with [Starlight](https://starlight.astro.build)
and hosted on Cloudflare. Every push to `main` deploys the site.

## Add or edit a page

Pages are Markdown files in `src/content/docs/`:

```
src/content/docs/
├── index.mdx              → the home page
├── hub/                   → "ASDL Hub" section in the sidebar
│   ├── overview.md        → /hub/overview/
│   ├── ...
│   └── reference/         → a sub-group inside the section
└── agent/                 → "ASDL Agent" section
```

1. Copy `templates/page.md` into the section folder, e.g.
   `src/content/docs/hub/backups.md`.
2. Set `title`, `description` and `sidebar.order` (lower = higher up).
3. Write the page in Markdown. Commit and push — it's live a minute later.

The sidebar builds itself from the folders, so there's nothing else to
register. To edit an existing page from the browser, use the **Edit page**
link at the bottom of any page.

### Add a new section (a new project)

1. Create a folder, e.g. `src/content/docs/myproject/`, with at least one page.
2. Add one line to the `sidebar` list in `astro.config.mjs`:
   ```js
   { label: 'My Project', items: [{ autogenerate: { directory: 'myproject' } }] },
   ```
3. Optionally add a card for it on the home page (`src/content/docs/index.mdx`).

## Preview locally

```bash
npm install
npm run dev      # http://localhost:4321, reloads as you edit
npm run build    # what the deploy runs; fails on broken pages
```

## Deploying

Pushes to `main` are deployed by GitHub Actions
(`.github/workflows/deploy.yml`) with Wrangler. To deploy by hand:

```bash
npm run build && npx wrangler deploy
```
