<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'about-story', labelKey: 'page.about.toc.story' },
		{ id: 'about-mission', labelKey: 'page.about.toc.mission' },
		{ id: 'about-values', labelKey: 'page.about.toc.values' },
		{ id: 'about-editorial', labelKey: 'page.about.toc.editorial' },
		{ id: 'about-contact', labelKey: 'page.about.toc.contact' }
	];

	const sections = [
		{
			id: 'about-story',
			titleKey: 'page.about.s1.title',
			bodyKeys: ['page.about.s1.p1', 'page.about.s1.p2']
		},
		{
			id: 'about-mission',
			titleKey: 'page.about.s2.title',
			bodyKeys: ['page.about.s2.p1']
		},
		{
			id: 'about-values',
			titleKey: 'page.about.s3.title',
			bullets: ['page.about.s3.b1', 'page.about.s3.b2', 'page.about.s3.b3']
		},
		{
			id: 'about-editorial',
			titleKey: 'page.about.s4.title',
			bodyKeys: ['page.about.s4.p1'],
			calloutKey: 'page.about.s4.callout'
		},
		{
			id: 'about-contact',
			titleKey: 'page.about.s5.title',
			bodyKeys: ['page.about.s5.p1'],
			span: 'full',
			items: [{ href: '/iletisim', labelKey: 'footer.contact' }, { href: '/kariyer', labelKey: 'footer.careers' }]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.about')} - MertNews</title>
</svelte:head>

<AppleInfoPage icon="about" titleKey="footer.about" subtitleKey="page.about.subtitle" {tocItems} {sections} />
