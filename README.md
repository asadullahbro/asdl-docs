# ASDL Docs

Source for **https://docs.asdl.website** — documentation for every ASDL
project. Built with [Starlight](https://starlight.astro.build) and hosted on
Cloudflare.

Each project has its own section at `docs.asdl.website/<slug>/` with its own
sidebar; a switcher at the top of the sidebar moves between projects, and the
home page lists them all.

```
src/
├── projects.mjs               → the list of projects (switcher + home page)
└── content/docs/
    ├── index.mdx              → home page (built from projects.mjs)
    └── hub/                   → ASDL Hub, at /hub/
        ├── overview.md        → /hub/overview/
        ├── ...
        ├── Agent/             → a sub-group in the Hub sidebar (folder name = label)
        └── Reference/
```

## Add a page to a project

1. Copy `templates/page.md` into the project's folder, e.g.
   `src/content/docs/hub/backups.md` (→ `/hub/backups/`).
2. Set `title`, `description` and `sidebar.order` (lower = higher up).
3. Write the page in Markdown, then commit and push.

The sidebar builds itself from the folder; put pages in a subfolder to group
them. To fix a typo from the browser, use **Edit page** at the bottom of any
page.

## Add a new project

1. Create `src/content/docs/<slug>/overview.md` (plus any other pages).
2. Add an entry to `src/projects.mjs`:
   ```js
   {
     slug: 'myproject',
     name: 'My Project',
     description: 'One or two sentences for the home page.',
     image: '/myproject.svg', // optional: a 64×64 icon in public/
     icon: 'puzzle',          // optional: built-in icon for the switcher
   },
   ```

That's all: it appears on the home page and in the switcher, at
`docs.asdl.website/myproject/`.

## Logos and colours

- `public/asdl-hub.svg`, `public/asdl-agent.svg`: app icons (dark tile).
- `src/assets/*-mark.svg`: the same marks without the tile.
- `src/styles/theme.css`: the orange accent colour.

## Preview locally

```bash
npm install
npm run dev      # http://localhost:4321, reloads as you edit
npm run build    # what the deploy runs; fails on broken pages
```

## Deploying

The site is a Cloudflare Worker named `asdl-docs` serving the built files,
on the custom domain `docs.asdl.website` (see `wrangler.jsonc`). Old URLs are
redirected in `public/_redirects`.

- **Automatic:** once the repo is connected in Cloudflare (Workers & Pages →
  `asdl-docs` → Settings → Build → Connect), every push to `main` builds and
  deploys it.
- **By hand**, from this folder (needs `npx wrangler login` once):
  ```bash
  npm run deploy
  ```
