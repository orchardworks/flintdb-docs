// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'FlintDB',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/orchardworks/flintdb' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Quick Start', slug: 'getting-started/quickstart' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Querying Data', slug: 'guides/querying' },
						{ label: 'Analytics', slug: 'guides/analytics' },
					],
				},
				{
					label: 'API Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
