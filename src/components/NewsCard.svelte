<script>
	import { selectedArticleStore } from '$lib/stores/modal';
	import { t } from '$lib/i18n';

	export let article;
	/** @type {boolean} */
	export let featured = false;
	/** @type {'carousel' | 'grid'} — ızgara: Apple tarzı iki sütunlu modül; carousel: yatay şerit (varsayılan) */
	export let layout = 'carousel';

	function openArticle(event) {
		event.preventDefault();
		selectedArticleStore.set(article);
	}

	function openModal() {
		selectedArticleStore.set(article);
	}

	/** @param {unknown} raw */
	function plainText(raw) {
		if (raw == null || typeof raw !== 'string') return '';
		return raw
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	$: snippetSource = plainText(
		article.contentSnippet || article.content || article.summary || article.description || ''
	);
	$: tagline =
		snippetSource.length > 0
			? snippetSource.slice(0, 140) + (snippetSource.length > 140 ? '…' : '')
			: article.category;

	/** @param {string} s */
	function hashLink(s) {
		let h = 0;
		for (let i = 0; i < s.length; i++) {
			h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
		}
		return Math.abs(h).toString(36);
	}

	$: gridTitleId = `grid-t-${hashLink(String(article.link || article.title || ''))}`;
</script>

{#if layout === 'grid'}
	<article class="grid-tile" aria-labelledby={gridTitleId}>
		<button type="button" class="grid-tile-media-hit" on:click={openModal} aria-label={article.title}>
			<div class="grid-tile-media">
				<img src={article.image} alt="" loading="lazy" draggable="false" />
			</div>
		</button>
		<div class="grid-tile-body">
			<p class="grid-tile-eyebrow">{article.category}</p>
			<h3 class="grid-tile-title" id={gridTitleId}>{article.title}</h3>
			<p class="grid-tile-tagline">{tagline}</p>
			<p class="grid-tile-meta">
				<span class="grid-tile-source">{article.source}</span>
				<span class="grid-tile-dot" aria-hidden="true">·</span>
				<span class="grid-tile-date">{article.formattedDate}</span>
			</p>
			<div class="grid-tile-actions">
				<button type="button" class="grid-pill grid-pill-primary" on:click={openModal}>
					{$t('hero.learnMore')}
				</button>
				<a
					href={article.link}
					class="grid-pill grid-pill-secondary"
					target="_blank"
					rel="noopener noreferrer"
				>
					{$t('news.openSource')}
				</a>
			</div>
		</div>
	</article>
{:else}
	<!-- apple.com.tr ürün kutusu / promo tile yapısı (yatay şerit) -->
	<a
		href={article.link}
		on:click={openArticle}
		class="tile"
		class:tile-featured={featured}
		aria-label={article.title}
	>
		<div class="tile-media">
			<img src={article.image} alt={article.title} loading="lazy" draggable="false" />
		</div>
		<div class="tile-body">
			<p class="tile-eyebrow">{article.category}</p>
			<h3 class="tile-title">{article.title}</h3>
			<p class="tile-meta">
				<span class="tile-source">{article.source}</span>
				<span class="tile-dot" aria-hidden="true"> </span>
				<span class="tile-date">{article.formattedDate}</span>
			</p>
			<span class="tile-cta apple-link-cta">
				{$t('hero.learnMore')}
				<svg class="tile-chevron" width="10" height="14" viewBox="0 0 7 12" fill="none" aria-hidden="true">
					<path d="M1 1.5L5.5 6L1 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</span>
		</div>
	</a>
{/if}

<style>
	/* ——— Grid: apple.com tam genişlik promo modülü ——— */
	.grid-tile {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 580px;
		background: var(--apple-gray-100);
		overflow: hidden;
	}

	:global([prefers-color-scheme='dark']) .grid-tile {
		background: var(--apple-gray-600);
	}

	.grid-tile-media-hit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		overflow: hidden;
		-webkit-tap-highlight-color: transparent;
	}

	.grid-tile-media-hit:focus-visible {
		outline: 3px solid var(--apple-blue);
		outline-offset: -3px;
	}

	.grid-tile-media {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.grid-tile-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform 0.65s cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.grid-tile:hover .grid-tile-media img {
		transform: scale(1.02);
	}

	.grid-tile-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem 2rem 2.5rem;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.grid-tile-eyebrow {
		display: none;
	}

	.grid-tile-title {
		font-family: var(--font-main);
		font-weight: 600;
		letter-spacing: -0.025em;
		line-height: 1.08;
		color: var(--fg);
		margin: 0;
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		max-width: 20ch;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.grid-tile-tagline {
		font-size: clamp(1rem, 1.6vw, 1.1875rem);
		font-weight: 400;
		color: var(--muted);
		margin: 0.35rem 0 0;
		line-height: 1.4;
		max-width: 32ch;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.grid-tile-meta {
		display: none;
	}

	.grid-tile-source,
	.grid-tile-dot,
	.grid-tile-date {
		display: none;
	}

	.grid-tile-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.65rem 1rem;
		margin-top: 1rem;
	}

	.grid-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: 0.5rem 1.5rem;
		border-radius: 980px;
		font-size: 1.0625rem;
		font-weight: 400;
		letter-spacing: -0.01em;
		text-decoration: none;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			transform 0.15s ease,
			border-color 0.2s ease;
		border: 2px solid transparent;
		-webkit-tap-highlight-color: transparent;
	}

	.grid-pill:focus-visible {
		outline: 2px solid var(--apple-blue);
		outline-offset: 2px;
	}

	.grid-pill-primary {
		background: var(--apple-blue);
		color: #fff;
		border-color: var(--apple-blue);
	}

	.grid-pill-primary:hover {
		background: var(--apple-blue-hover);
		border-color: var(--apple-blue-hover);
	}

	.grid-pill-secondary {
		background: transparent;
		color: var(--apple-blue);
		border-color: var(--apple-blue);
	}

	.grid-pill-secondary:hover {
		background: rgba(0, 102, 204, 0.06);
	}

	:global([prefers-color-scheme='dark']) .grid-pill-secondary:hover {
		background: rgba(10, 132, 255, 0.12);
	}

	@media (max-width: 734px) {
		.grid-tile {
			min-height: 420px;
		}
		.grid-tile-body {
			padding: 1.5rem 1.25rem 2rem;
		}
		.grid-tile-title {
			font-size: 1.5rem;
		}
	}

	/* ——— Carousel tile (yatay şerit) ——— */
	.tile {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--card-bg);
		border-radius: 18px;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--apple-tile-shadow);
		border: 1px solid var(--card-border);
		transition:
			transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
			box-shadow 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.tile:hover {
		transform: translateY(-3px);
		box-shadow: var(--apple-tile-shadow-hover);
		opacity: 1;
	}

	.tile:hover .tile-media img {
		transform: scale(1.04);
	}

	.tile-media {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--apple-gray-200);
	}

	.tile-featured .tile-media {
		aspect-ratio: 16 / 10;
	}

	:global([prefers-color-scheme='dark']) .tile-media {
		background: var(--apple-gray-500);
	}

	.tile-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.tile-body {
		padding: 1.25rem 1.35rem 1.5rem;
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 0.35rem;
		text-align: center;
		align-items: center;
	}

	.tile-featured .tile-body {
		padding: 1.5rem 1.75rem 1.75rem;
		gap: 0.5rem;
	}

	.tile-eyebrow {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--apple-eyebrow);
		margin: 0;
		line-height: 1.2;
	}

	.tile-title {
		font-family: var(--font-main);
		font-weight: 600;
		letter-spacing: -0.022em;
		line-height: 1.15;
		color: var(--fg);
		margin: 0.25rem 0 0;
		max-width: 32ch;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: clamp(1.25rem, 2.1vw, 1.5rem);
	}

	.tile-featured .tile-title {
		font-size: clamp(1.5rem, 2.8vw, 2.125rem);
		-webkit-line-clamp: 4;
		line-clamp: 4;
		max-width: 28ch;
	}

	.tile-meta {
		font-size: 0.8125rem;
		font-weight: 400;
		color: var(--apple-eyebrow);
		margin: 0.35rem 0 0;
		line-height: 1.4;
	}

	.tile-source {
		color: var(--apple-blue);
	}

	.tile-dot::before {
		content: '·';
		margin: 0 0.2em;
		opacity: 0.7;
	}

	.tile-cta {
		margin-top: auto;
		padding-top: 0.85rem;
	}

	.tile-chevron {
		flex-shrink: 0;
		margin-top: 1px;
	}
</style>
