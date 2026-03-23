<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const tocItems = [
		{ id: 'settings-lang', labelKey: 'page.settings.toc.lang' },
		{ id: 'settings-theme', labelKey: 'page.settings.toc.theme' },
		{ id: 'settings-notify', labelKey: 'page.settings.toc.notify' },
		{ id: 'settings-privacy', labelKey: 'page.settings.toc.privacy' }
	];

	const sections = [
		{
			id: 'settings-lang',
			titleKey: 'page.settings.s1.title',
			bodyKeys: ['page.settings.s1.p1'],
			calloutKey: 'page.settings.s1.callout'
		},
		{
			id: 'settings-theme',
			titleKey: 'page.settings.s2.title',
			bodyKeys: ['page.settings.s2.p1']
		},
		{
			id: 'settings-notify',
			titleKey: 'page.settings.s3.title',
			bodyKeys: ['page.settings.s3.p1']
		},
		{
			id: 'settings-privacy',
			titleKey: 'page.settings.s4.title',
			bodyKeys: ['page.settings.s4.p1'],
			span: 'full',
			items: [
				{ href: '/gizlilik', labelKey: 'footer.privacy' },
				{ href: '/cerezler', labelKey: 'footer.cookies' },
				{ href: '/iletisim', labelKey: 'footer.contact' }
			]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.settings')} - MertNews</title>
</svelte:head>

<AppleInfoPage icon="settings" titleKey="footer.settings" subtitleKey="page.settings.subtitle" {tocItems} {sections} />
