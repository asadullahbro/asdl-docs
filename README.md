# ASDL Docs

Source for **https://docs.asdl.website** — documentation for ASDL Hub, ASDL
Agent and related projects. Built with [Starlight](https://starlight.astro.build)
and hosted on Cloudflare.

## Add or edit a page

Pages are Markdown files in `src/content/docs/`:

```
src/content/docs/
├── index.mdx              → the home page
├── hub/                   → "ASDL Hub" section in the sidebar
│   ├── overview.md        → /hub/overview/
│   ├── ...
│   └── Reference/         → a sub-group (folder name = its label)
└── agent/                 → "ASDL Agent" section
```

1. Copy `templates/page.md` into the section folder, e.g.
   `src/content/docs/hub/backups.md`.
2. Set `title`, `description` and `sidebar.order` (lower = higher up).
3. Write the page in Markdown, then commit and push.

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

The site is a Cloudflare Worker named `asdl-docs` serving the built files,
on the custom domain `docs.asdl.website` (see `wrangler.jsonc`).

- **Automatic:** once the repo is connected in Cloudflare (Workers & Pages →
  `asdl-docs` → Settings → Build → Connect), every push to `main` builds and
  deploys it.
- **By hand**, from this folder (needs `npx wrangler login` once):
  ```bash
  npm run deploy
  ```
