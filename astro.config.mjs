// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'motion.bits',
			customCss: [
				'@fontsource/ibm-plex-serif/400.css',
				'@fontsource/geist-sans/400.css',
				'@fontsource/geist-sans/700.css',
				'@fontsource/source-code-pro/700.css',
				"/src/custom.css"
				],
			social: {
				github: 'https://github.com/withastro/starlight',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
