<script>
	import NewsCard from '../../components/NewsCard.svelte';
	import AppleHorizontalScroll from '../../components/AppleHorizontalScroll.svelte';
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	/** @type {import('./$types').PageData} */
	export let data;

	$: news = data.news ?? [];
	$: categoryName = data.categoryName;
	$: sourceOptions = data.sourceOptions ?? [];
	$: activeSourceSlugs = data.activeSourceSlugs ?? [];

	// Category display names mapping
	const categoryKeys = {
		Dunya: 'category.world',
		Turkiye: 'category.turkey',
		Teknoloji: 'category.technology',
		Ekonomi: 'category.economy'
	};

	$: pageTitle = $t(categoryKeys[categoryName] || categoryName);
	$: basePath = $page.url.pathname;
	$: pathname = $page.url.pathname;
	$: hasSourceFilter = activeSourceSlugs.length > 0;

	$: useCarousel = news.length > 6;
	$: carouselArticles = useCarousel ? news.slice(0, 10) : [];
	$: gridArticles = useCarousel ? news.slice(10) : news;
</script>

<svelte:head>
	<title>{pageTitle} - MertNews</title>
</svelte:head>

<main>
	<header class="category-header">
		<div class="container header-content">
			<h1 class="animate-reveal">{pageTitle}</h1>
			<p class="header-subtitle animate-reveal" style="animation-delay: 0.1s">
				{$t('category.subtitle')}
			</p>
			{#if sourceOptions.length > 0}
				<div class="source-strip touch-scroll animate-reveal" style="animation-delay: 0.15s">
					<span class="source-strip-label">{$t('category.sourceStrip')}</span>
					<div class="source-chips">
						<a
							href={basePath}
							class="src-chip"
							class:active={!hasSourceFilter}
							data-sveltekit-preload-data="hover">{$t('nav.allStories')}</a>
						{#each sourceOptions as opt}
							<a
								href="/kaynak/{opt.slug}"
								class="src-chip"
								class:active={pathname === `/kaynak/${opt.slug}` ||
									(pathname === basePath &&
										activeSourceSlugs.length === 1 &&
										activeSourceSlugs[0] === opt.slug)}
								data-sveltekit-preload-data="hover">{opt.name}</a>
						{/each}
					</div>
				</div>
			{/if}
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
		padding: 3.5rem 0 2.5rem;
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
		font-size: clamp(1.0625rem, 3vw, 1.5rem);
		color: var(--muted);
		font-weight: 500;
		max-width: 700px;
		margin: 0 auto;
		letter-spacing: -0.01em;
	}

	.source-strip {
		margin-top: 2rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.75rem 1rem;
		max-width: 920px;
		margin-left: auto;
		margin-right: auto;
		padding: 0 0.5rem;
	}

	.source-strip-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--muted);
		flex-shrink: 0;
	}

	.source-chips {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.4rem;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		padding-bottom: 2px;
		max-width: 100%;
		scroll-snap-type: x proximity;
		mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent,
			black 12px,
			black calc(100% - 12px),
			transparent
		);
	}

	.source-chips::-webkit-scrollbar {
		display: none;
	}

	.src-chip {
		scroll-snap-align: start;
		flex-shrink: 0;
		font-size: 0.78rem;
		font-weight: 500;
		padding: 0.42rem 0.85rem;
		border-radius: 999px;
		border: 1px solid var(--apple-nav-border);
		background: color-mix(in srgb, var(--fg) 5%, transparent);
		color: var(--fg);
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
		white-space: nowrap;
	}

	.src-chip:hover {
		border-color: color-mix(in srgb, var(--apple-blue) 45%, var(--apple-nav-border));
		color: var(--apple-blue);
		opacity: 1;
	}

	.src-chip.active {
		background: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
		font-weight: 600;
	}

	:global([prefers-color-scheme='dark']) .src-chip.active {
		background: var(--apple-white);
		color: var(--apple-black);
		border-color: var(--apple-white);
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
	.no-news {
		grid-column: 1 / -1;
		text-align: center;
		padding: 100px 0;
		color: var(--muted);
		font-size: 1.25rem;
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
