<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'ads-formats', labelKey: 'page.ads.toc.formats' },
		{ id: 'ads-audience', labelKey: 'page.ads.toc.audience' },
		{ id: 'ads-process', labelKey: 'page.ads.toc.process' },
		{ id: 'ads-measure', labelKey: 'page.ads.toc.measure' },
		{ id: 'ads-contact', labelKey: 'page.ads.toc.contact' }
	];

	const sections = [
		{
			id: 'ads-formats',
			titleKey: 'page.ads.s1.title',
			bodyKeys: ['page.ads.s1.p1'],
			pairs: [
				{ labelKey: 'page.ads.pair1.l', valueKey: 'page.ads.pair1.v' },
				{ labelKey: 'page.ads.pair2.l', valueKey: 'page.ads.pair2.v' },
				{ labelKey: 'page.ads.pair3.l', valueKey: 'page.ads.pair3.v' }
			]
		},
		{
			id: 'ads-audience',
			titleKey: 'page.ads.s2.title',
			bodyKeys: ['page.ads.s2.p1']
		},
		{
			id: 'ads-process',
			titleKey: 'page.ads.s3.title',
			steps: [
				{ titleKey: 'page.ads.s3.step1t', bodyKey: 'page.ads.s3.step1b' },
				{ titleKey: 'page.ads.s3.step2t', bodyKey: 'page.ads.s3.step2b' },
				{ titleKey: 'page.ads.s3.step3t', bodyKey: 'page.ads.s3.step3b' }
			]
		},
		{
			id: 'ads-measure',
			titleKey: 'page.ads.s4.title',
			bodyKeys: ['page.ads.s4.p1']
		},
		{
			id: 'ads-contact',
			titleKey: 'page.ads.s5.title',
			bodyKeys: ['page.ads.s5.p1'],
			span: 'full',
			items: [{ href: '/iletisim', labelKey: 'footer.contact' }]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.ads')} - MertNews</title>
</svelte:head>

<AppleInfoPage icon="ads" titleKey="footer.ads" subtitleKey="page.ads.subtitle" {tocItems} {sections} />
