<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'privacy-scope', labelKey: 'page.privacy.toc.scope' },
		{ id: 'privacy-data', labelKey: 'page.privacy.toc.data' },
		{ id: 'privacy-use', labelKey: 'page.privacy.toc.use' },
		{ id: 'privacy-legal', labelKey: 'page.privacy.toc.legal' },
		{ id: 'privacy-retention', labelKey: 'page.privacy.toc.retention' },
		{ id: 'privacy-rights', labelKey: 'page.privacy.toc.rights' },
		{ id: 'privacy-contact', labelKey: 'page.privacy.toc.contact' }
	];

	const sections = [
		{
			id: 'privacy-scope',
			titleKey: 'page.privacy.s1.title',
			bodyKeys: ['page.privacy.s1.p1', 'page.privacy.s1.p2']
		},
		{
			id: 'privacy-data',
			titleKey: 'page.privacy.s2.title',
			bullets: ['page.privacy.s2.b1', 'page.privacy.s2.b2', 'page.privacy.s2.b3', 'page.privacy.s2.b4']
		},
		{
			id: 'privacy-use',
			titleKey: 'page.privacy.s3.title',
			bodyKeys: ['page.privacy.s3.p1']
		},
		{
			id: 'privacy-legal',
			titleKey: 'page.privacy.s4.title',
			bodyKeys: ['page.privacy.s4.p1']
		},
		{
			id: 'privacy-retention',
			titleKey: 'page.privacy.s5.title',
			bodyKeys: ['page.privacy.s5.p1']
		},
		{
			id: 'privacy-rights',
			titleKey: 'page.privacy.s6.title',
			bodyKeys: ['page.privacy.s6.p1']
		},
		{
			id: 'privacy-contact',
			titleKey: 'page.privacy.s7.title',
			bodyKeys: ['page.privacy.s7.p1'],
			span: 'full',
			items: [
				{ href: '/iletisim', labelKey: 'footer.contact' },
				{ href: '/cerezler', labelKey: 'footer.cookies' }
			]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.privacy')} - MertNews</title>
</svelte:head>

<AppleInfoPage icon="lock" titleKey="footer.privacy" subtitleKey="page.privacy.subtitle" {tocItems} {sections} />
