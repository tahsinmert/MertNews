<script>
	import { selectedArticleStore } from '$lib/stores/modal';
	import { fade } from 'svelte/transition';
	import { t } from '$lib/i18n';
	export let article;

	function openArticle(event) {
		event.preventDefault();
		selectedArticleStore.set(article);
	}
</script>

{#if article}
	<section class="hero" in:fade={{ duration: 700 }}>
		<div class="hero-bg" style="background-image: url({article.image})"></div>
		<div class="hero-scrim"></div>

		<div class="container hero-inner">
			<div class="hero-copy">
				<p class="hero-eyebrow">{article.category}</p>
				<h1 class="hero-headline">{article.title}</h1>
				<p class="hero-sub">
					<span class="hero-source">{article.source}</span>
					<span class="hero-dot">·</span>
					{article.formattedDate}
				</p>
				<div class="hero-ctas">
					<a href={article.link} on:click={openArticle} class="hero-btn-primary">{$t('hero.readMore')}</a>
					<a href={article.link} on:click={openArticle} class="hero-btn-link apple-link-cta">
						{$t('hero.learnMore')}
						<svg width="10" height="14" viewBox="0 0 7 12" fill="none" aria-hidden="true">
							<path d="M1 1.5L5.5 6L1 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	/* apple.com.tr ana modül – ortalanmış tipografi + mavi metin bağlantısı */
	.hero {
		position: relative;
		min-height: calc(100vh - var(--nav-height));
		min-height: calc(100dvh - var(--nav-height));
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: clamp(3rem, 8vh, 5rem);
		padding-top: 2rem;
		overflow: hidden;
		background: var(--bg);
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center 30%;
		transform: scale(1.06);
		filter: brightness(0.92) saturate(1.05);
	}

	:global([prefers-color-scheme='light']) .hero-bg {
		filter: brightness(1.02) saturate(1.02);
		opacity: 0.95;
	}

	.hero-scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			var(--bg) 0%,
			rgba(0, 0, 0, 0.45) 45%,
			rgba(0, 0, 0, 0.25) 100%
		);
	}

	:global([prefers-color-scheme='light']) .hero-scrim {
		background: linear-gradient(
			to top,
			var(--bg) 0%,
			rgba(255, 255, 255, 0.92) 50%,
			rgba(255, 255, 255, 0.65) 100%
		);
	}

	.hero-inner {
		position: relative;
		z-index: 2;
		width: 100%;
	}

	.hero-copy {
		max-width: 820px;
		margin: 0 auto;
		text-align: center;
	}

	.hero-eyebrow {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--apple-eyebrow);
		margin: 0 0 0.5rem;
	}

	:global([prefers-color-scheme='light']) .hero-eyebrow {
		color: var(--apple-gray-500);
	}

	.hero-headline {
		font-family: var(--font-main);
		font-size: clamp(2.5rem, 6.5vw, 4.5rem);
		font-weight: 600;
		line-height: 1.05;
		letter-spacing: -0.045em;
		color: var(--fg);
		margin: 0 0 0.75rem;
	}

	.hero-sub {
		font-size: clamp(1.0625rem, 2vw, 1.25rem);
		font-weight: 400;
		color: var(--muted);
		margin: 0 0 1.75rem;
		line-height: 1.4;
	}

	.hero-source {
		color: var(--apple-blue);
	}

	.hero-dot {
		margin: 0 0.35em;
		opacity: 0.6;
	}

	.hero-ctas {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1.25rem 2rem;
	}

	.hero-btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3.25rem;
		padding: 0.7rem 1.35rem;
		border-radius: 980px;
		background: var(--apple-blue);
		color: #fff;
		font-size: 1.0625rem;
		font-weight: 400;
		letter-spacing: -0.01em;
		transition:
			background 0.2s ease,
			transform 0.2s ease;
	}

	.hero-btn-primary:hover {
		background: var(--apple-blue-hover);
		transform: scale(1.02);
		opacity: 1;
	}

	/* global a:hover opacity — Apple CTA’lar tam opak kalsın */
	.hero-ctas a:hover {
		opacity: 1;
	}

	.hero-btn-link {
		font-size: 1.0625rem;
	}

	@media (max-width: 734px) {
		.hero {
			min-height: auto;
			padding-top: 3rem;
			padding-bottom: 3rem;
		}

		.hero-ctas {
			flex-direction: column;
		}
	}
</style>
