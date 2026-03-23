<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'cookies-what', labelKey: 'page.cookies.toc.what' },
		{ id: 'cookies-types', labelKey: 'page.cookies.toc.types' },
		{ id: 'cookies-third', labelKey: 'page.cookies.toc.third' },
		{ id: 'cookies-control', labelKey: 'page.cookies.toc.control' },
		{ id: 'cookies-updates', labelKey: 'page.cookies.toc.updates' }
	];

	const sections = [
		{
			id: 'cookies-what',
			titleKey: 'page.cookies.s1.title',
			bodyKeys: ['page.cookies.s1.p1']
		},
		{
			id: 'cookies-types',
			titleKey: 'page.cookies.s2.title',
			pairs: [
				{ labelKey: 'page.cookies.s2.pair1.l', valueKey: 'page.cookies.s2.pair1.v' },
				{ labelKey: 'page.cookies.s2.pair2.l', valueKey: 'page.cookies.s2.pair2.v' },
				{ labelKey: 'page.cookies.s2.pair3.l', valueKey: 'page.cookies.s2.pair3.v' }
			]
		},
		{
			id: 'cookies-third',
			titleKey: 'page.cookies.s3.title',
			bodyKeys: ['page.cookies.s3.p1']
		},
		{
			id: 'cookies-control',
			titleKey: 'page.cookies.s4.title',
			bodyKeys: ['page.cookies.s4.p1']
		},
		{
			id: 'cookies-updates',
			titleKey: 'page.cookies.s5.title',
			bodyKeys: ['page.cookies.s5.p1'],
			span: 'full',
			items: [
				{ href: '/gizlilik', labelKey: 'footer.privacy' },
				{ href: '/ayarlar', labelKey: 'footer.settings' }
			]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.cookies')} - MertNews</title>
</svelte:head>

<AppleInfoPage titleKey="footer.cookies" subtitleKey="page.cookies.subtitle" {tocItems} {sections} />
