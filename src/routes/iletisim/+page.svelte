<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import ContactForm from '../../components/ContactForm.svelte';
	import { t } from '$lib/i18n';

	const sections = [
		{
			id: 'contact-channels',
			titleKey: 'page.contact.channels.title',
			bodyKeys: ['page.contact.channels.p1'],
			span: 'full',
			pairs: [
				{ labelKey: 'page.contact.email.label', valueKey: 'page.contact.email.value' },
				{ labelKey: 'page.contact.hours.label', valueKey: 'page.contact.hours.value' }
			]
		},
		{
			id: 'contact-note',
			titleKey: 'page.contact.note.title',
			bodyKeys: ['page.contact.note.p1'],
			span: 'full',
			variant: 'subtle'
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.contact')} - MertNews</title>
</svelte:head>

<AppleInfoPage icon="contact" titleKey="footer.contact" subtitleKey="page.contact.subtitle" tocItems={[]} {sections}>
	<ContactForm />
</AppleInfoPage>
