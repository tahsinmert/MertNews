<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'help-overview', labelKey: 'page.help.toc.overview' },
		{ id: 'help-navigate', labelKey: 'page.help.toc.navigate' },
		{ id: 'help-search', labelKey: 'page.help.toc.search' },
		{ id: 'help-newsletter', labelKey: 'page.help.toc.newsletter' },
		{ id: 'help-trouble', labelKey: 'page.help.toc.trouble' },
		{ id: 'help-more', labelKey: 'page.help.toc.more' }
	];

	const sections = [
		{
			id: 'help-overview',
			titleKey: 'page.help.s1.title',
			bodyKeys: ['page.help.s1.p1', 'page.help.s1.p2', 'page.help.s1.p3']
		},
		{
			id: 'help-navigate',
			titleKey: 'page.help.s2.title',
			bodyKeys: ['page.help.s2.p1', 'page.help.s2.p2'],
			bullets: ['page.help.s2.b1', 'page.help.s2.b2', 'page.help.s2.b3']
		},
		{
			id: 'help-search',
			titleKey: 'page.help.s3.title',
			bodyKeys: ['page.help.s3.p1', 'page.help.s3.p2'],
			bullets: ['page.help.s3.b1', 'page.help.s3.b2']
		},
		{
			id: 'help-newsletter',
			titleKey: 'page.help.s4.title',
			bodyKeys: ['page.help.s4.p1', 'page.help.s4.p2'],
			steps: [
				{ titleKey: 'page.help.s4.step1t', bodyKey: 'page.help.s4.step1b' },
				{ titleKey: 'page.help.s4.step2t', bodyKey: 'page.help.s4.step2b' },
				{ titleKey: 'page.help.s4.step3t', bodyKey: 'page.help.s4.step3b' }
			]
		},
		{
			id: 'help-trouble',
			titleKey: 'page.help.s5.title',
			bodyKeys: ['page.help.s5.p1'],
			calloutKey: 'page.help.s5.callout',
			variant: 'callout'
		},
		{
			id: 'help-more',
			titleKey: 'page.help.s6.title',
			bodyKeys: ['page.help.s6.p1'],
			span: 'full',
			items: [
				{ href: '/iletisim', labelKey: 'footer.contact' },
				{ href: '/gizlilik', labelKey: 'footer.privacy' },
				{ href: '/site-haritasi', labelKey: 'footer.sitemap' }
			]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.help')} - MertNews</title>
</svelte:head>

<AppleInfoPage icon="help" titleKey="footer.help" subtitleKey="page.help.subtitle" {tocItems} {sections} />
