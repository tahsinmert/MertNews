<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'terms-accept', labelKey: 'page.terms.toc.accept' },
		{ id: 'terms-license', labelKey: 'page.terms.toc.license' },
		{ id: 'terms-conduct', labelKey: 'page.terms.toc.conduct' },
		{ id: 'terms-ip', labelKey: 'page.terms.toc.ip' },
		{ id: 'terms-disclaimer', labelKey: 'page.terms.toc.disclaimer' },
		{ id: 'terms-changes', labelKey: 'page.terms.toc.changes' },
		{ id: 'terms-law', labelKey: 'page.terms.toc.law' }
	];

	const sections = [
		{
			id: 'terms-accept',
			titleKey: 'page.terms.s1.title',
			bodyKeys: ['page.terms.s1.p1']
		},
		{
			id: 'terms-license',
			titleKey: 'page.terms.s2.title',
			bodyKeys: ['page.terms.s2.p1']
		},
		{
			id: 'terms-conduct',
			titleKey: 'page.terms.s3.title',
			bullets: ['page.terms.s3.b1', 'page.terms.s3.b2', 'page.terms.s3.b3']
		},
		{
			id: 'terms-ip',
			titleKey: 'page.terms.s4.title',
			bodyKeys: ['page.terms.s4.p1']
		},
		{
			id: 'terms-disclaimer',
			titleKey: 'page.terms.s5.title',
			bodyKeys: ['page.terms.s5.p1'],
			variant: 'callout'
		},
		{
			id: 'terms-changes',
			titleKey: 'page.terms.s7.title',
			bodyKeys: ['page.terms.s7.p1']
		},
		{
			id: 'terms-law',
			titleKey: 'page.terms.s6.title',
			bodyKeys: ['page.terms.s6.p1'],
			span: 'full',
			items: [
				{ href: '/gizlilik', labelKey: 'footer.privacy' },
				{ href: '/iletisim', labelKey: 'footer.contact' }
			]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.terms')} - MertNews</title>
</svelte:head>

<AppleInfoPage titleKey="footer.terms" subtitleKey="page.terms.subtitle" {tocItems} {sections} />
