## Content

Docs pages are Markdown in `src/content/docs/<section>/`; sidebars are
generated from the folders. Follow README.md (and `templates/page.md`) when
adding pages or sections, and keep pages accurate to the current ASDL Hub
and Agent code — check the source (github.com/asadullahbro/ASDL-Hub,
asdl-agent) rather than guessing dashboard labels or API fields.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
