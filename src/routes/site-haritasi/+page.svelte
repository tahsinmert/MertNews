<script>
	import AppleInfoPage from '../../components/AppleInfoPage.svelte';
	import { t } from '$lib/i18n';

	const sections = [];

	const groups = [
		{
			titleKey: 'page.sitemap.group.main',
			links: [
				{ href: '/', labelKey: 'nav.home', descKey: 'page.sitemap.desc.home' },
				{ href: '/finans', labelKey: 'nav.finance', descKey: 'page.sitemap.desc.finance' },
				{ href: '/spor', labelKey: 'section.all', descKey: 'page.sitemap.desc.all' },
				{ href: '/abone', labelKey: 'footer.subscription', descKey: 'subscribe.subtitle' }
			]
		},
		{
			titleKey: 'page.sitemap.group.news',
			links: [
				{ href: '/dunya', labelKey: 'nav.world' },
				{ href: '/turkiye', labelKey: 'nav.turkey' },
				{ href: '/teknoloji', labelKey: 'nav.technology' },
				{ href: '/ekonomi', labelKey: 'nav.economy' }
			]
		},
		{
			titleKey: 'page.sitemap.group.sources',
			links: [{ href: '/kaynak', labelKey: 'nav.allSources', descKey: 'page.sitemap.desc.sources' }]
		},
		{
			titleKey: 'page.sitemap.group.support',
			links: [
				{ href: '/yardim', labelKey: 'footer.help' },
				{ href: '/iletisim', labelKey: 'footer.contact' },
				{ href: '/hakkimizda', labelKey: 'footer.about' },
				{ href: '/reklam', labelKey: 'footer.ads' },
				{ href: '/kariyer', labelKey: 'footer.careers' }
			]
		},
		{
			titleKey: 'page.sitemap.group.account',
			links: [
				{ href: '/profil', labelKey: 'footer.profile' },
				{ href: '/ayarlar', labelKey: 'footer.settings' },
				{ href: '/gizlilik', labelKey: 'footer.privacy' },
				{ href: '/cerezler', labelKey: 'footer.cookies' },
				{ href: '/kullanim-sartlari', labelKey: 'footer.terms' }
			]
		}
	];
</script>

<svelte:head>
	<title>{$t('footer.sitemap')} - MertNews</title>
</svelte:head>

<AppleInfoPage titleKey="footer.sitemap" subtitleKey="page.sitemap.subtitle" tocItems={[]} {sections}>
	<div class="sitemap">
		{#each groups as group}
			<section class="sitemap-group apple-glass">
				<h2 class="group-title">{$t(group.titleKey)}</h2>
				<ul class="card-list">
					{#each group.links as link}
						<li>
							<a href={link.href} class="sitemap-card">
								<span class="card-title">{$t(link.labelKey)}</span>
								{#if link.descKey}
									<span class="card-desc">{$t(link.descKey)}</span>
								{/if}
								<span class="card-chevron" aria-hidden="true">›</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</AppleInfoPage>

<style>
	.sitemap {
		margin-top: 24px;
		display: grid;
		grid-template-columns: 1fr;
		gap: 20px;
	}

	@media (min-width: 900px) {
		.sitemap {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.sitemap-group {
		border-radius: 20px;
		border: 1px solid var(--glass-border);
		padding: 22px 20px;
	}

	.group-title {
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--muted);
		margin-bottom: 14px;
	}

	.card-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.sitemap-card {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto auto;
		gap: 4px 12px;
		align-items: center;
		padding: 14px 16px;
		border-radius: 14px;
		border: 1px solid var(--card-border);
		background: rgba(255, 255, 255, 0.45);
		transition:
			transform 0.2s,
			box-shadow 0.2s,
			border-color 0.2s;
	}

	:global([prefers-color-scheme='dark']) .sitemap-card {
		background: rgba(29, 29, 31, 0.55);
	}

	.sitemap-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
		border-color: rgba(0, 102, 204, 0.25);
		opacity: 1;
	}

	:global([prefers-color-scheme='dark']) .sitemap-card:hover {
		box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
		border-color: rgba(10, 132, 255, 0.3);
	}

	.card-title {
		grid-column: 1;
		grid-row: 1;
		font-size: 0.98rem;
		font-weight: 600;
		color: var(--fg);
		letter-spacing: -0.02em;
	}

	.card-desc {
		grid-column: 1;
		grid-row: 2;
		font-size: 0.82rem;
		color: var(--muted);
		line-height: 1.45;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-chevron {
		grid-column: 2;
		grid-row: 1 / span 2;
		font-size: 1.25rem;
		color: var(--accent);
		opacity: 0.7;
	}
</style>
