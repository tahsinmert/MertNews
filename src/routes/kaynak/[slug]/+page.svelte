<script>
	import Hero from '../../../components/Hero.svelte';
	import NewsCard from '../../../components/NewsCard.svelte';
	import AppleHorizontalScroll from '../../../components/AppleHorizontalScroll.svelte';
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	/** @type {import('./$types').PageData} */
	export let data;

	const categoryLabelKeys = {
		Dunya: 'category.world',
		Turkiye: 'category.turkey',
		Teknoloji: 'category.technology',
		Ekonomi: 'category.economy'
	};

	$: meta = data.meta;
	$: news = data.news ?? [];
	$: siblingSources = data.siblingSources ?? [];
	$: heroArticle = news[0] ?? null;
	$: rest = news.slice(1);
	$: categoryTitle = $t(categoryLabelKeys[meta.category] ?? meta.category);
	$: useCarousel = rest.length > 6;
	$: carouselArticles = useCarousel ? rest.slice(0, 10) : [];
	$: gridArticles = useCarousel ? rest.slice(10) : rest;
	$: pathname = $page.url.pathname;
</script>

<svelte:head>
	<title>{meta.name} — {$t('source.pageTitleSuffix')} | MertNews</title>
	<meta name="description" content="{meta.name} · {categoryTitle}" />
</svelte:head>

<main class="source-page">
	{#if heroArticle}
		<Hero article={heroArticle} />
	{:else}
		<header class="empty-hero">
			<div class="container">
				<nav class="crumb" aria-label="Breadcrumb">
					<a href="/">{$t('page.common.breadcrumbHome')}</a>
					<span class="crumb-sep" aria-hidden="true">/</span>
					<a href="/kaynak">{$t('source.indexShort')}</a>
					<span class="crumb-sep" aria-hidden="true">/</span>
					<span class="crumb-current">{meta.name}</span>
				</nav>
				<p class="src-eyebrow">{categoryTitle}</p>
				<h1 class="src-headline">{meta.name}</h1>
				<p class="src-lead">{$t('source.emptyFeed')}</p>
			</div>
		</header>
	{/if}

	<div class="src-toolbar" class:src-toolbar--compact={heroArticle}>
		<div class="container toolbar-inner">
			<nav class="crumb crumb--toolbar" aria-label="Breadcrumb">
				<a href="/">{$t('page.common.breadcrumbHome')}</a>
				<span class="crumb-sep" aria-hidden="true">/</span>
				<a href="/kaynak">{$t('source.indexShort')}</a>
				<span class="crumb-sep" aria-hidden="true">/</span>
				<span class="crumb-current">{meta.name}</span>
			</nav>
			<div class="toolbar-row">
				<div class="toolbar-copy">
					{#if !heroArticle}
						<p class="src-eyebrow src-eyebrow--toolbar">{categoryTitle}</p>
						<h2 class="toolbar-title">{meta.name}</h2>
					{/if}
					<p class="toolbar-note" class:toolbar-note--solo={heroArticle}>{$t('source.rssNote')}</p>
				</div>
				<div class="toolbar-actions">
					<a
						href={meta.categoryPath}
						class="btn-secondary"
						data-sveltekit-preload-data="hover">{$t('source.viewCategory')}</a
					>
					<a
						href={meta.rssUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="btn-ghost">{$t('source.openRss')}</a
					>
				</div>
			</div>
			{#if siblingSources.length > 0}
				<div class="sibling-strip">
					<span class="sibling-label">{$t('source.moreSources')}</span>
					<div class="sibling-chips touch-scroll">
						{#each siblingSources as s (s.slug)}
							<a
								href="/kaynak/{s.slug}"
								class="sib-chip"
								class:active={pathname === `/kaynak/${s.slug}`}
								data-sveltekit-preload-data="hover">{s.name}</a
							>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

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

			<div class="news-grid">
				{#if gridArticles.length > 0}
					{#each gridArticles as article, i (article.link)}
						<div class="grid-item animate-reveal" style="animation-delay: {0.05 * (i % 6)}s">
							<NewsCard {article} layout="grid" />
						</div>
					{/each}
				{:else if news.length <= 1 && news.length > 0}
					<!-- hero-only: grid empty -->
				{:else if news.length === 0}
					<div class="no-news">{$t('category.noNews')}</div>
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	main.source-page {
		min-height: 100vh;
		padding-top: var(--nav-height);
		background: var(--bg);
	}

	.empty-hero {
		padding: calc(var(--nav-height) + 4rem) 0 3rem;
		text-align: center;
	}

	.src-eyebrow {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.75rem;
	}

	.src-eyebrow--toolbar {
		margin-bottom: 0.35rem;
	}

	.src-headline {
		font-size: clamp(2.25rem, 6vw, 3.5rem);
		font-weight: 600;
		letter-spacing: -0.04em;
		color: var(--fg);
		margin: 0 0 1rem;
	}

	.src-lead {
		color: var(--muted);
		font-size: 1.125rem;
		max-width: 480px;
		margin: 0 auto;
	}

	.crumb {
		font-size: 0.75rem;
		color: var(--muted);
		margin-bottom: 1.25rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		justify-content: center;
	}

	.crumb--toolbar {
		justify-content: flex-start;
		margin-bottom: 1rem;
	}

	.crumb a {
		color: var(--link, #06c);
		text-decoration: none;
	}

	.crumb a:hover {
		text-decoration: underline;
	}

	.crumb-sep {
		opacity: 0.45;
	}

	.crumb-current {
		color: var(--fg);
		font-weight: 500;
	}

	.src-toolbar {
		background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 96%, #8882) 0%, var(--bg) 100%);
		border-bottom: 1px solid var(--glass-border, rgba(0, 0, 0, 0.06));
		padding: 2rem 0 1.75rem;
	}

	.src-toolbar--compact {
		padding: 1.25rem 0 1.5rem;
	}

	.toolbar-note--solo {
		max-width: none;
		margin: 0;
	}

	.toolbar-inner {
		max-width: 1120px;
	}

	.toolbar-row {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	@media (min-width: 768px) {
		.toolbar-row {
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
		}
	}

	.toolbar-title {
		font-size: clamp(1.75rem, 4vw, 2.35rem);
		font-weight: 600;
		letter-spacing: -0.035em;
		margin: 0 0 0.35rem;
		color: var(--fg);
	}

	.toolbar-note {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--muted);
		line-height: 1.45;
		max-width: 520px;
	}

	.toolbar-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		flex-shrink: 0;
	}

	.btn-secondary,
	.btn-ghost {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.55rem 1.1rem;
		border-radius: 980px;
		font-size: 0.8125rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease;
	}

	.btn-secondary {
		background: var(--fg);
		color: var(--bg);
		border: 1px solid transparent;
	}

	.btn-secondary:hover {
		opacity: 0.88;
	}

	.btn-ghost {
		background: transparent;
		color: var(--link, #06c);
		border: 1px solid color-mix(in srgb, var(--link, #06c) 35%, transparent);
	}

	.btn-ghost:hover {
		background: color-mix(in srgb, var(--link, #06c) 8%, transparent);
	}

	.sibling-strip {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--glass-border, rgba(0, 0, 0, 0.06));
	}

	.sibling-label {
		display: block;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.65rem;
	}

	.sibling-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.sib-chip {
		padding: 0.4rem 0.85rem;
		border-radius: 980px;
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		color: var(--fg);
		background: color-mix(in srgb, var(--fg) 5%, transparent);
		border: 1px solid color-mix(in srgb, var(--fg) 10%, transparent);
		white-space: nowrap;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.sib-chip:hover {
		background: color-mix(in srgb, var(--fg) 9%, transparent);
	}

	.sib-chip.active {
		background: var(--fg);
		color: var(--bg);
		border-color: transparent;
	}

	.apple-gallery-strip {
		padding-bottom: 4rem;
	}

	.carousel-heading {
		padding: 0 1rem;
		margin-bottom: 0.5rem;
	}

	.carousel-title {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--fg);
	}

	.news-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 24px;
		padding: 1.5rem 0 0;
		max-width: 1400px;
		margin: 0 auto;
	}

	.no-news {
		grid-column: 1 / -1;
		text-align: center;
		padding: 3rem 1rem;
		color: var(--muted);
		font-size: 1.0625rem;
	}
</style>
