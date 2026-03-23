<script>
	import { t } from '$lib/i18n';

	/** @type {import('./$types').PageData} */
	export let data;

	const categoryLabelKeys = {
		Dunya: 'nav.world',
		Turkiye: 'nav.turkey',
		Teknoloji: 'nav.technology',
		Ekonomi: 'nav.economy'
	};

	$: groups = data.groups ?? [];
</script>

<svelte:head>
	<title>{$t('source.indexTitle')} — MertNews</title>
	<meta name="description" content={$t('source.indexSubtitle')} />
</svelte:head>

<main class="source-hub">
	<header class="hub-hero">
		<div class="container hub-inner">
			<p class="hub-eyebrow animate-reveal">MertNews</p>
			<h1 class="hub-title animate-reveal" style="animation-delay: 0.06s">{$t('source.indexTitle')}</h1>
			<p class="hub-sub animate-reveal" style="animation-delay: 0.12s">{$t('source.indexSubtitle')}</p>
		</div>
	</header>

	<div class="hub-body container">
		{#each groups as g, gi (g.category)}
			<section class="hub-section apple-glass animate-reveal" style="animation-delay: {0.04 * gi}s">
				<div class="section-head">
					<h2 class="section-title">{$t(categoryLabelKeys[g.category] ?? g.category)}</h2>
					<a href={g.items[0]?.categoryPath ?? '/'} class="section-cta" data-sveltekit-preload-data="hover">
						{$t('source.viewCategory')}
						<span aria-hidden="true">›</span>
					</a>
				</div>
				<ul class="source-grid">
					{#each g.items as item (item.slug)}
						<li>
							<a href="/kaynak/{item.slug}" class="source-tile" data-sveltekit-preload-data="hover">
								<span class="tile-name">{item.name}</span>
								<span class="tile-meta">
									<span class="tile-lang">{item.lang?.toUpperCase?.() ?? item.lang}</span>
									<span class="tile-chevron" aria-hidden="true">›</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</main>

<style>
	main.source-hub {
		min-height: 100vh;
		padding-top: var(--nav-height);
		background: var(--bg);
	}

	.hub-hero {
		padding: calc(var(--nav-height) + 3rem) 0 2.5rem;
		text-align: center;
		border-bottom: 1px solid var(--glass-border, rgba(0, 0, 0, 0.06));
	}

	:global([prefers-color-scheme='dark']) .hub-hero {
		border-bottom-color: rgba(255, 255, 255, 0.08);
	}

	.hub-eyebrow {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.75rem;
	}

	.hub-title {
		font-size: clamp(2.5rem, 7vw, 4rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		color: var(--fg);
		margin: 0 0 1rem;
	}

	.hub-sub {
		font-size: 1.25rem;
		line-height: 1.45;
		color: var(--muted);
		font-weight: 500;
		max-width: 560px;
		margin: 0 auto;
		letter-spacing: -0.02em;
	}

	.hub-body {
		padding: 2.5rem 0 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.hub-section {
		border-radius: 22px;
		border: 1px solid var(--glass-border);
		padding: 1.5rem 1.35rem 1.35rem;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: saturate(160%) blur(16px);
		-webkit-backdrop-filter: saturate(160%) blur(16px);
	}

	.section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.1rem;
		padding: 0 0.15rem;
	}

	.section-title {
		font-size: 1.35rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--fg);
		margin: 0;
	}

	.section-cta {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--link, #06c);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		white-space: nowrap;
	}

	.section-cta:hover {
		text-decoration: underline;
	}

	.source-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 10px;
	}

	@media (min-width: 640px) {
		.source-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.source-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.source-tile {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 14px;
		text-decoration: none;
		color: var(--fg);
		background: color-mix(in srgb, var(--fg) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--fg) 8%, transparent);
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.source-tile:hover {
		background: color-mix(in srgb, var(--fg) 7%, transparent);
		border-color: color-mix(in srgb, var(--fg) 12%, transparent);
		transform: translateY(-1px);
	}

	.tile-name {
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.3;
	}

	.tile-meta {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		flex-shrink: 0;
	}

	.tile-lang {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--muted);
		padding: 0.2rem 0.45rem;
		border-radius: 6px;
		background: color-mix(in srgb, var(--fg) 6%, transparent);
	}

	.tile-chevron {
		font-size: 1.1rem;
		font-weight: 300;
		color: var(--muted);
	}
</style>
