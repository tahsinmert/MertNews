<script>
	import Hero from '../components/Hero.svelte';
	import NewsCard from '../components/NewsCard.svelte';
	import SkeletonCard from '../components/SkeletonCard.svelte';
	import CurrencyGrid from '../components/CurrencyGrid.svelte';
	import AppleHorizontalScroll from '../components/AppleHorizontalScroll.svelte';
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	/** @type {import('./$types').PageData} */
	export let data;

	$: news = data.news ?? [];
	$: heroArticle = news[0] ?? null;
	$: otherArticles = news.slice(1);
	$: pathname = $page.url.pathname;
	$: activeSlugs = $page.url.searchParams.getAll('kaynak');
	$: homeAllActive = pathname === '/' && activeSlugs.length === 0;

	$: useCarousel = otherArticles.length > 6;
	$: carouselArticles = useCarousel ? otherArticles.slice(0, 10) : [];
	$: gridArticles = useCarousel ? otherArticles.slice(10) : otherArticles;
</script>

<svelte:head>
	<title>MertNews</title>
</svelte:head>

<main class="apple-home">
	{#if heroArticle}
		<Hero article={heroArticle} />
	{:else if news.length === 0 && activeSlugs.length > 0}
		<div class="empty-hero animate-reveal">
			<p class="empty-hero-title">{$t('category.filteredEmpty')}</p>
			<a href="/" class="empty-hero-link">{$t('nav.clearFilter')}</a>
		</div>
	{:else if news.length === 0}
		<div class="empty-hero animate-reveal">
			<p class="empty-hero-title">{$t('category.noNews')}</p>
		</div>
	{:else}
		<div style="height: 70vh; width: 100%;" class="skeleton"></div>
	{/if}

	<div class="apple-gallery-strip">
		<div class="apple-gallery-strip-inner news-feed">
			<div class="section-header animate-reveal">
				<h2 class="section-title">{$t('section.latest')}</h2>
				<div class="section-header-right">
					{#if activeSlugs.length > 0}
						<div class="filter-bar">
							<span class="filter-bar-label">{$t('nav.filterActive')}</span>
							<a href="/" class="filter-bar-clear">{$t('nav.clearFilter')}</a>
						</div>
					{/if}
					<div class="categories touch-scroll">
						<a href="/" class="cat-btn" class:active={homeAllActive} data-sveltekit-preload-data="hover"
							>{$t('section.all')}</a
						>
						<a
							href="/dunya"
							class="cat-btn"
							class:active={pathname === '/dunya'}
							data-sveltekit-preload-data="hover">{$t('nav.world')}</a
						>
						<a
							href="/turkiye"
							class="cat-btn"
							class:active={pathname === '/turkiye'}
							data-sveltekit-preload-data="hover">{$t('nav.turkey')}</a
						>
						<a
							href="/teknoloji"
							class="cat-btn"
							class:active={pathname === '/teknoloji'}
							data-sveltekit-preload-data="hover">{$t('nav.technology')}</a
						>
						<a
							href="/ekonomi"
							class="cat-btn"
							class:active={pathname === '/ekonomi'}
							data-sveltekit-preload-data="hover">{$t('nav.economy')}</a
						>
						<a
							href="/spor"
							class="cat-btn"
							class:active={pathname === '/spor'}
							data-sveltekit-preload-data="hover">{$t('nav.sports')}</a
						>
						<a
							href="/finans"
							class="cat-btn"
							class:active={pathname === '/finans'}
							data-sveltekit-preload-data="hover">{$t('nav.finance')}</a
						>
					</div>
				</div>
			</div>

			{#if carouselArticles.length > 0}
				<AppleHorizontalScroll>
					<div slot="header" class="carousel-heading">
						<h2 class="carousel-title">{$t('section.carousel')}</h2>
					</div>
					{#each carouselArticles as article, i (article.link)}
						<div class="apple-hscroll-slide" class:is-featured={i === 0}>
							<NewsCard {article} featured={i === 0} />
						</div>
					{/each}
				</AppleHorizontalScroll>
			{/if}

		</div>
	</div>

	<div class="promo-grid">
		{#if gridArticles.length > 0}
			{#each gridArticles as article, i}
				<div class="promo-cell animate-reveal" style="animation-delay: {0.04 * (i % 8)}s">
					<NewsCard {article} layout="grid" />
				</div>
			{/each}
		{:else if otherArticles.length === 0 && news.length > 1}
			{#each Array(6) as _, i}
				<div class="promo-cell">
					<SkeletonCard layout="grid" />
				</div>
			{/each}
		{:else if news.length <= 1 && news.length > 0}
			<p class="grid-end-note">{$t('category.subtitle')}</p>
		{/if}
	</div>
</main>

<CurrencyGrid data={data.currencyData} />

<style>
	.apple-home {
		min-height: 100vh;
		padding-top: var(--nav-height);
	}

	.empty-hero {
		min-height: 42vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 4rem 1.5rem;
		text-align: center;
	}

	.empty-hero-title {
		font-size: 1.125rem;
		color: var(--muted);
		max-width: 420px;
		line-height: 1.45;
		margin: 0;
	}

	.empty-hero-link {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--apple-blue);
	}

	.grid-end-note {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--muted);
		font-size: 0.9375rem;
		padding: 2rem 0;
		margin: 0;
	}

	.news-feed {
		padding: 5rem 0 6rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 3rem;
		flex-wrap: wrap;
		gap: 1.25rem;
	}

	.section-header-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.65rem;
		max-width: 100%;
	}

	.filter-bar {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.filter-bar-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted);
		letter-spacing: 0.02em;
	}

	.filter-bar-clear {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--apple-blue);
		padding: 0.25rem 0.65rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--apple-blue) 12%, transparent);
	}

	.section-title {
		font-family: var(--font-main);
		font-size: clamp(2.5rem, 5vw, 3.5rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		line-height: 1.05;
		color: var(--fg);
	}

	.carousel-heading {
		margin: 0;
	}

	.carousel-title {
		font-family: var(--font-main);
		font-size: clamp(1.75rem, 3.5vw, 2.5rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		line-height: 1.08;
		color: var(--fg);
		margin: 0;
	}

	.categories {
		display: flex;
		gap: 0.35rem;
		overflow-x: auto;
		padding-bottom: 0.35rem;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		scroll-snap-type: x proximity;
	}

	.categories::-webkit-scrollbar {
		display: none;
	}

	/* apple.com – şerit üzerinde minimal chip’ler */
	.cat-btn {
		scroll-snap-align: start;
		background: rgba(0, 0, 0, 0.04);
		border: none;
		color: var(--fg);
		padding: 0.45rem 1rem;
		font-size: 0.875rem;
		font-weight: 400;
		border-radius: 980px;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
		text-decoration: none;
	}

	:global([prefers-color-scheme='dark']) .cat-btn {
		background: rgba(255, 255, 255, 0.08);
	}

	.cat-btn:hover {
		background: rgba(0, 0, 0, 0.07);
		color: var(--apple-blue);
		opacity: 1;
	}

	:global([prefers-color-scheme='dark']) .cat-btn:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.cat-btn.active {
		background: var(--fg);
		color: var(--bg);
		font-weight: 500;
	}

	:global([prefers-color-scheme='dark']) .cat-btn.active {
		background: var(--apple-white);
		color: var(--apple-black);
	}

	.promo-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0;
		width: 100%;
	}

	.promo-cell {
		min-width: 0;
		border-top: 1px solid var(--card-border);
	}

	.promo-cell:nth-child(odd) {
		border-right: 1px solid var(--card-border);
	}

	@media (max-width: 734px) {
		.promo-grid {
			grid-template-columns: 1fr;
		}
		.promo-cell:nth-child(odd) {
			border-right: none;
		}
	}
	@media (max-width: 900px) {
		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.5rem;
		}

		.section-header-right {
			align-items: flex-start;
			width: 100%;
		}

		.filter-bar {
			justify-content: flex-start;
		}
	}
</style>
