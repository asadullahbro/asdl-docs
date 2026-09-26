// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import { projects } from './src/projects.mjs';

// Projects are listed in src/projects.mjs; each gets its own sidebar built
// from src/content/docs/<slug>/. See README.md for adding pages and projects.
export default defineConfig({
	site: 'https://docs.asdl.website',
	integrations: [
		starlight({
			title: 'ASDL Docs',
			description: 'Documentation for ASDL projects.',
			logo: { src: './src/assets/asdl-hub-mark.svg', alt: '' },
			customCss: ['./src/styles/theme.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/asadullahbro' }],
			editLink: {
				baseUrl: 'https://github.com/asadullahbro/asdl-docs/edit/main/',
			},
			lastUpdated: true,
			plugins: [
				starlightSidebarTopics(
					projects.map((p) => ({
						id: p.slug,
						label: p.name,
						link: `/${p.slug}/overview/`,
						icon: p.icon,
						badge: p.badge,
						items: [{ autogenerate: { directory: p.slug } }],
					})),
					// The home page lists all projects rather than belonging to one.
					{ exclude: ['/'] },
				),
			],
		}),
	],
});
