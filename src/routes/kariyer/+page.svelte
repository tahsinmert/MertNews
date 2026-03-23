<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'careers-culture', labelKey: 'page.careers.toc.culture' },
		{ id: 'careers-roles', labelKey: 'page.careers.toc.roles' },
		{ id: 'careers-benefits', labelKey: 'page.careers.toc.benefits' },
		{ id: 'careers-apply', labelKey: 'page.careers.toc.apply' },
		{ id: 'careers-dei', labelKey: 'page.careers.toc.dei' }
	];

	const sections = [
		{
			id: 'careers-culture',
			titleKey: 'page.careers.s1.title',
			bodyKeys: ['page.careers.s1.p1']
		},
		{
			id: 'careers-roles',
			titleKey: 'page.careers.s2.title',
			bullets: ['page.careers.s2.b1', 'page.careers.s2.b2', 'page.careers.s2.b3']
		},
		{
			id: 'careers-benefits',
			titleKey: 'page.careers.s3.title',
			bodyKeys: ['page.careers.s3.p1']
		},
		{
			id: 'careers-apply',
			titleKey: 'page.careers.s4.title',
			bodyKeys: ['page.careers.s4.p1']
		},
		{
			id: 'careers-dei',
			titleKey: 'page.careers.s5.title',
			bodyKeys: ['page.careers.s5.p1'],
			span: 'full',
			items: [{ href: '/iletisim', labelKey: 'footer.contact' }]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.careers')} - MertNews</title>
</svelte:head>

<AppleInfoPage titleKey="footer.careers" subtitleKey="page.careers.subtitle" {tocItems} {sections} />
