<script>
	import { onMount, onDestroy, tick, afterUpdate } from 'svelte';
	import { t } from '$lib/i18n';

	/** Arka plan: kenar solukları bu renge karışır (varsayılan şerit rengi) */
	export let fadeBg = '';
	/** i18n anahtarı — bölge etiketi */
	export let regionLabelKey = 'carousel.ariaRegion';

	let trackEl;
	let canPrev = false;
	let canNext = false;
	let reduceMotion = false;
	let raf = 0;
	let ro;

	function syncArrows() {
		if (!trackEl) return;
		const { scrollLeft, scrollWidth, clientWidth } = trackEl;
		const maxScroll = scrollWidth - clientWidth;
		if (maxScroll <= 8) {
			canPrev = false;
			canNext = false;
			return;
		}
		canPrev = scrollLeft > 8;
		canNext = scrollLeft < maxScroll - 8;
	}

	function onScroll() {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(syncArrows);
	}

	function stepSize() {
		const slide = trackEl?.querySelector('.apple-hscroll-slide');
		if (!slide) return 360;
		const gap = parseFloat(getComputedStyle(trackEl).columnGap || getComputedStyle(trackEl).gap) || 18;
		return slide.getBoundingClientRect().width + gap;
	}

	/** @param {number} dir -1 | 1 */
	function go(dir) {
		if (!trackEl) return;
		trackEl.scrollBy({
			left: dir * stepSize(),
			behavior: reduceMotion ? 'auto' : 'smooth'
		});
	}

	/** @param {KeyboardEvent} e */
	function onKeydown(e) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			go(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			go(-1);
		}
	}

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = mq.matches;
		const onMq = () => {
			reduceMotion = mq.matches;
		};
		mq.addEventListener('change', onMq);

		tick().then(() => {
			syncArrows();
			if (trackEl && typeof ResizeObserver !== 'undefined') {
				ro = new ResizeObserver(() => syncArrows());
				ro.observe(trackEl);
			}
		});

		return () => {
			mq.removeEventListener('change', onMq);
			ro?.disconnect();
			cancelAnimationFrame(raf);
		};
	});

	onDestroy(() => {
		if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf);
		ro?.disconnect();
	});

	afterUpdate(() => {
		if (trackEl) syncArrows();
	});
</script>

<section
	class="apple-hscroll"
	class:apple-hscroll--no-nav={!canPrev && !canNext}
	style={fadeBg ? `--hscroll-fade-bg: ${fadeBg};` : ''}
>
	<div class="apple-hscroll__header-wrap">
		<div class="apple-hscroll__header container">
			<slot name="header" />
		</div>
	</div>

	<div class="apple-hscroll__viewport">
		<div
			class="apple-hscroll__fade apple-hscroll__fade--left"
			style="opacity: {canPrev ? 1 : 0}"
			aria-hidden="true"
		></div>
		<div
			class="apple-hscroll__fade apple-hscroll__fade--right"
			style="opacity: {canNext ? 1 : 0}"
			aria-hidden="true"
		></div>

		<!-- Önce şerit: bazı tarayıcılarda üstteki tam boy katman + kaydırma, tıklamanın karta ulaşmasını bozabiliyor -->
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			bind:this={trackEl}
			class="apple-hscroll__track"
			role="region"
			tabindex="0"
			aria-label={$t(regionLabelKey)}
			on:scroll={onScroll}
			on:keydown={onKeydown}
		>
			<slot />
		</div>

		<div class="apple-hscroll__nav">
			<button
				type="button"
				class="apple-hscroll__btn apple-hscroll__btn--prev"
				on:click={() => go(-1)}
				disabled={!canPrev}
				aria-label={$t('carousel.prev')}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M15 6l-6 6 6 6"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<button
				type="button"
				class="apple-hscroll__btn apple-hscroll__btn--next"
				on:click={() => go(1)}
				disabled={!canNext}
				aria-label={$t('carousel.next')}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M9 6l6 6-6 6"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	.apple-hscroll {
		--hscroll-pad: max(
			22px,
			env(safe-area-inset-left),
			calc((100vw - min(100vw, var(--apple-container))) / 2)
		);
		--hscroll-pad-end: max(
			22px,
			env(safe-area-inset-right),
			calc((100vw - min(100vw, var(--apple-container))) / 2)
		);
		--hscroll-fade-bg: var(--apple-section-bg);
		width: 100%;
		position: relative;
	}

	.apple-hscroll__header-wrap {
		width: 100%;
	}

	.apple-hscroll__header {
		max-width: var(--apple-container);
		margin: 0 auto 1.5rem;
		padding-left: max(22px, env(safe-area-inset-left));
		padding-right: max(22px, env(safe-area-inset-right));
	}

	/* Tam genişlik kaydırma — apple.com “gallery” hizası */
	.apple-hscroll__viewport {
		position: relative;
		width: 100vw;
		margin-left: calc(50% - 50vw);
	}

	.apple-hscroll__track {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: row;
		gap: 1.125rem;
		margin: 0;
		padding: 4px var(--hscroll-pad-end) 1.25rem var(--hscroll-pad);
		overflow-x: auto;
		overflow-y: visible;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: var(--hscroll-pad);
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		outline: none;
	}

	.apple-hscroll__track:focus-visible {
		box-shadow: inset 0 0 0 2px var(--apple-blue);
		border-radius: 12px;
	}

	.apple-hscroll__track::-webkit-scrollbar {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.apple-hscroll__track {
			scroll-snap-type: none;
		}
	}

	:global(.apple-hscroll__track > .apple-hscroll-slide) {
		flex: 0 0 clamp(272px, 76vw, 400px);
		scroll-snap-align: start;
		scroll-snap-stop: normal;
		display: flex;
		min-width: 0;
	}

	:global(.apple-hscroll__track > .apple-hscroll-slide.is-featured) {
		flex: 0 0 clamp(300px, 84vw, 480px);
	}

	:global(.apple-hscroll__track .apple-hscroll-slide > .tile) {
		width: 100%;
		min-height: 100%;
		/* Yatay kaydırmada dokunma genelde scroll’a gider; tıklamayı güvenilirleştirir */
		touch-action: manipulation;
		-webkit-user-drag: none;
	}

	:global(.apple-hscroll__track .tile-media img) {
		-webkit-user-drag: none;
		pointer-events: none;
	}

	.apple-hscroll__fade {
		position: absolute;
		top: 0;
		bottom: 1rem;
		width: min(72px, 12vw);
		z-index: 2;
		pointer-events: none;
		transition: opacity 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.apple-hscroll__fade--left {
		left: 0;
		background: linear-gradient(to right, var(--hscroll-fade-bg), transparent);
	}

	.apple-hscroll__fade--right {
		right: 0;
		background: linear-gradient(to left, var(--hscroll-fade-bg), transparent);
	}

	.apple-hscroll--no-nav .apple-hscroll__fade {
		opacity: 0 !important;
	}

	.apple-hscroll__nav {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		width: 100%;
		display: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.apple-hscroll__nav {
			display: block;
		}
	}

	.apple-hscroll__btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: auto;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		border: 1px solid var(--card-border);
		background: var(--glass-bg);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		color: var(--fg);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--apple-tile-shadow);
		transition:
			transform 0.2s ease,
			opacity 0.2s ease,
			background 0.2s ease;
		opacity: 1;
	}

	.apple-hscroll__btn:hover:not(:disabled) {
		transform: translateY(-50%) scale(1.07);
		box-shadow: var(--apple-tile-shadow-hover);
	}

	.apple-hscroll__btn:disabled {
		opacity: 0.22;
		pointer-events: none;
		cursor: default;
	}

	.apple-hscroll__btn--prev {
		left: max(8px, calc(var(--hscroll-pad) - 6px));
	}

	.apple-hscroll__btn--next {
		right: max(8px, calc(var(--hscroll-pad-end) - 6px));
	}

	.apple-hscroll--no-nav .apple-hscroll__btn {
		display: none;
	}

	@media (max-width: 734px) {
		.apple-hscroll__btn--prev {
			left: max(4px, env(safe-area-inset-left));
		}

		.apple-hscroll__btn--next {
			right: max(4px, env(safe-area-inset-right));
		}
	}
</style>
