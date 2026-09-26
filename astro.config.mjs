// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// To add a page, create a .md file in src/content/docs/<section>/ — the
// sidebar below picks it up automatically. To add a whole new section (a new
// product), add a folder and one entry to `sidebar`. See README.md.
export default defineConfig({
	site: 'https://docs.asdl.website',
	integrations: [
		starlight({
			title: 'ASDL Docs',
			description: 'Documentation for ASDL Hub, ASDL Agent and related projects.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/asadullahbro/ASDL-Hub' },
			],
			editLink: {
				baseUrl: 'https://github.com/asadullahbro/asdl-docs/edit/main/',
			},
			lastUpdated: true,
			sidebar: [
				{ label: 'ASDL Hub', items: [{ autogenerate: { directory: 'hub' } }] },
				{ label: 'ASDL Agent', items: [{ autogenerate: { directory: 'agent' } }] },
			],
		}),
	],
});
