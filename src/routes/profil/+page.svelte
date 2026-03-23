<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'profile-overview', labelKey: 'page.profile.toc.overview' },
		{ id: 'profile-data', labelKey: 'page.profile.toc.data' },
		{ id: 'profile-security', labelKey: 'page.profile.toc.security' },
		{ id: 'profile-links', labelKey: 'page.profile.toc.links' }
	];

	const sections = [
		{
			id: 'profile-overview',
			titleKey: 'page.profile.s1.title',
			bodyKeys: ['page.profile.s1.p1', 'page.profile.s1.p2']
		},
		{
			id: 'profile-data',
			titleKey: 'page.profile.s2.title',
			bodyKeys: ['page.profile.s2.p1']
		},
		{
			id: 'profile-security',
			titleKey: 'page.profile.s3.title',
			bullets: ['page.profile.s3.b1', 'page.profile.s3.b2', 'page.profile.s3.b3']
		},
		{
			id: 'profile-links',
			titleKey: 'page.profile.s4.title',
			bodyKeys: ['page.profile.s4.p1'],
			span: 'full',
			items: [
				{ href: '/abone', labelKey: 'footer.subscription' },
				{ href: '/ayarlar', labelKey: 'footer.settings' },
				{ href: '/yardim', labelKey: 'footer.help' }
			]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.profile')} - MertNews</title>
</svelte:head>

<AppleInfoPage titleKey="footer.profile" subtitleKey="page.profile.subtitle" {tocItems} {sections} />
