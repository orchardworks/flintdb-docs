// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.flintdb.dev',
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
					label: 'Examples',
					items: [
						{ label: 'Stock Analytics', slug: 'examples/stock-analytics' },
						{ label: 'RAG Search', slug: 'examples/rag-search' },
						{ label: 'Log Analyzer', slug: 'examples/log-analyzer' },
						{ label: 'Sensor Dashboard', slug: 'examples/sensor-dashboard' },
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
