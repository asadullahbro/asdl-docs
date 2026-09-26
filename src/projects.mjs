// Every project documented on docs.asdl.website. Each one gets its own
// section at docs.asdl.website/<slug>/ with its own sidebar, a place in the
// project switcher at the top of the sidebar, and a card on the home page.
//
// To add a project:
//   1. Write its pages in src/content/docs/<slug>/ (at least overview.md).
//   2. Add an entry below. That's it — the sidebar builds itself from the folder.
//   3. Optional: put a 64×64 icon at public/<slug>.svg and set `image`.

/**
 * @typedef {object} Project
 * @property {string} slug        URL path and docs folder, e.g. 'hub' → /hub/
 * @property {string} name        Shown in the switcher and on the home page
 * @property {string} description One or two sentences for the home page card
 * @property {string} [image]     Icon for the home page card, from public/
 * @property {string} [icon]      Starlight built-in icon for the switcher
 *                                (https://starlight.astro.build/reference/icons/)
 * @property {string} [badge]     Small label next to the name, e.g. 'Beta'
 */

/** @type {Project[]} */
export const projects = [
	{
		slug: 'hub',
		name: 'ASDL Hub',
		description:
			'Run your apps across your own machines: deploys from GitHub, encrypted secrets, domains with HTTPS, and automatic failover when a machine goes down.',
		image: '/asdl-hub.svg',
		icon: 'rocket',
	},
];
