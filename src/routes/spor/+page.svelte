<script>
	import NewsCard from '../../components/NewsCard.svelte';
	import AppleHorizontalScroll from '../../components/AppleHorizontalScroll.svelte';
	import { t } from '$lib/i18n';

	/** @type {import('./$types').PageData} */
	export let data;

	$: news = data.news ?? [];
	$: activeSourceSlugs = data.activeSourceSlugs ?? [];
	$: hasSourceFilter = activeSourceSlugs.length > 0;

	$: useCarousel = news.length > 6;
	$: carouselArticles = useCarousel ? news.slice(0, 10) : [];
	$: gridArticles = useCarousel ? news.slice(10) : news;
</script>

<svelte:head>
	<title>{$t('section.all')} - MertNews</title>
</svelte:head>

<main>
	<header class="category-header">
		<div class="container header-content">
			<h1 class="animate-reveal">{$t('section.all')}</h1>
			<p class="header-subtitle animate-reveal" style="animation-delay: 0.1s">
				{$t('category.subtitle')}
			</p>
		</div>
	</header>

	<div class="apple-gallery-strip">
		<div class="apple-gallery-strip-inner news-feed">
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
		{:else if news.length === 0}
			<div class="no-news">
				{hasSourceFilter ? $t('category.filteredEmpty') : $t('category.noNews')}
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		padding-top: var(--nav-height);
	}

	.category-header {
		padding: calc(var(--nav-height) + 3.5rem) 0 3rem;
		text-align: center;
		background: var(--bg);
		transition: background-color 0.3s ease;
	}

	.category-header h1 {
		font-size: clamp(2.75rem, 8vw, 4.75rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		margin-bottom: 24px;
		color: var(--fg);
	}

	.header-subtitle {
		font-size: 1.5rem;
		color: var(--muted);
		font-weight: 500;
		max-width: 700px;
		margin: 0 auto;
		letter-spacing: -0.01em;
	}

	.news-feed {
		padding: 3rem 0 5rem;
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

	.no-news {
		grid-column: 1 / -1;
		text-align: center;
		padding: 100px 0;
		color: var(--muted);
		font-size: 1.25rem;
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
</style>

