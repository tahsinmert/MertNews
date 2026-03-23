<script>
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';

	export let data = { rates: {}, crypto: {} };

	let displayData = data;

	/** Aşağı kaydırma ile gizle, yukarı ile göster (px eşiği — titreşim önleme) */
	const DELTA_THRESHOLD = 8;
	const TOP_ALWAYS_VISIBLE = 20;

	let lastY = 0;
	let tickerVisible = true;

	const pairs = [
		{ code: 'USD', label: 'currency.usd', icon: '$' },
		{ code: 'EUR', label: 'currency.eur', icon: '€' },
		{ code: 'GBP', label: 'currency.gbp', icon: '£' },
		{ code: 'BTC', label: 'currency.btc', icon: '₿', isCrypto: true },
		{ code: 'ETH', label: 'currency.eth', icon: 'Ξ', isCrypto: true }
	];

	async function refreshData() {
		try {
			const res = await fetch('/api/currency');
			const newData = await res.json();
			if (newData && newData.updatedAt !== displayData.updatedAt) {
				displayData = newData;
			}
		} catch (e) {
			console.error('Ticker refresh error:', e);
		}
	}

	function onScroll() {
		const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
		const delta = y - lastY;
		lastY = y;

		if (y < TOP_ALWAYS_VISIBLE) {
			tickerVisible = true;
		} else if (delta > DELTA_THRESHOLD) {
			tickerVisible = false;
		} else if (delta < -DELTA_THRESHOLD) {
			tickerVisible = true;
		}
	}

	onMount(() => {
		lastY = window.scrollY ?? document.documentElement.scrollTop ?? 0;
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		const interval = setInterval(refreshData, 30000);
		return () => {
			window.removeEventListener('scroll', onScroll);
			clearInterval(interval);
		};
	});

	/** @param {string | number | null | undefined} ch */
	function fmtTickerCh(ch) {
		if (ch == null || ch === '') return '—';
		const n = parseFloat(String(ch));
		if (!Number.isFinite(n)) return '—';
		const s = Math.abs(n).toFixed(2);
		if (n > 0) return `↑ ${s}%`;
		if (n < 0) return `↓ ${s}%`;
		return `${s}%`;
	}

	/** @param {string | number | null | undefined} ch */
	function chUp(ch) {
		if (ch == null || ch === '') return false;
		return parseFloat(String(ch)) > 0;
	}

	/** @param {string | number | null | undefined} ch */
	function chDown(ch) {
		if (ch == null || ch === '') return false;
		return parseFloat(String(ch)) < 0;
	}

	function getPairValue(pair) {
		if (pair.isCrypto) {
			const crypto = displayData.crypto[pair.code];
			return crypto
				? {
						price: crypto.priceTRY.toLocaleString('tr-TR', { maximumFractionDigits: 0 }),
						change: crypto.change
					}
				: null;
		}
		const rate = displayData.rates[pair.code];
		return rate
			? {
					price: Number(rate.selling).toFixed(2),
					change: rate.change
				}
			: null;
	}
</script>

<div
	class="ticker-bar glass-pill-mini"
	class:ticker-hidden={!tickerVisible}
	aria-hidden={!tickerVisible}
	aria-label={$t('currency.market')}
>
	<div class="ticker-content">
		<div class="live-indicator">
			<span class="dot"></span>
			<span class="label">{$t('currency.market')}</span>
		</div>

		<div class="separator"></div>

		<div class="items-wrapper">
			<div class="items-scroll animate-marquee">
				{#each [1, 2, 3] as _}
					{#each pairs as pair}
						{@const display = getPairValue(pair)}
						{#if display}
							<div class="ticker-item">
								<span class="icon">{pair.icon}</span>
								<span class="code">{$t(pair.label)}</span>
								<span class="price">₺ {display.price}</span>
								<span class="change" class:up={chUp(display.change)} class:down={chDown(display.change)}>
									{fmtTickerCh(display.change)}
								</span>
							</div>
						{/if}
					{/each}
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.ticker-bar {
		position: fixed;
		top: calc(var(--nav-height) + 6px);
		left: 50%;
		transform: translate3d(-50%, 0, 0) scale(1);
		height: 32px;
		max-width: var(--apple-container);
		width: calc(100% - 40px);
		z-index: 999;
		display: flex;
		align-items: center;
		padding: 0 16px;
		opacity: 1;
		pointer-events: auto;
		/* Apple / iOS benzeri: hafif overshoot hissi */
		transition:
			transform 0.5s cubic-bezier(0.32, 0.72, 0, 1),
			opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.ticker-bar.ticker-hidden {
		transform: translate3d(-50%, calc(-100% - 18px), 0) scale(0.96);
		opacity: 0;
		pointer-events: none;
		transition:
			transform 0.48s cubic-bezier(0.32, 0.72, 0, 1),
			opacity 0.32s cubic-bezier(0.4, 0, 1, 1);
	}

	.glass-pill-mini {
		background: var(--glass-bg);
		backdrop-filter: blur(25px) saturate(180%);
		-webkit-backdrop-filter: blur(25px) saturate(180%);
		border: 1px solid var(--glass-border);
		border-radius: 99px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.ticker-content {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 12px;
		overflow: hidden;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
		background: rgba(52, 199, 89, 0.1);
		padding: 4px 10px;
		border-radius: 99px;
	}

	.dot {
		width: 6px;
		height: 6px;
		background: #34c759;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
			box-shadow: 0 0 8px #34c759;
		}
		100% {
			opacity: 0.4;
		}
	}

	.label {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #34c759;
	}

	.separator {
		width: 1px;
		height: 12px;
		background: var(--glass-border);
	}

	.items-wrapper {
		flex: 1;
		overflow: hidden;
		mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
	}

	.items-scroll {
		display: flex;
		gap: 32px;
		padding-right: 32px;
		white-space: nowrap;
	}

	.animate-marquee {
		animation: marquee 60s linear infinite;
	}

	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-33.33%);
		}
	}

	.items-scroll:hover {
		animation-play-state: paused;
	}

	.ticker-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.icon {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.code {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--fg);
	}

	.price {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--fg);
		font-family: 'SF Mono', monospace;
	}

	.change {
		font-size: 0.7rem;
		font-weight: 700;
	}

	.change.up {
		color: #34c759;
	}
	.change.down {
		color: #ff3b30;
	}

	@media (max-width: 600px) {
		.ticker-bar {
			width: calc(100% - 16px);
			top: calc(var(--nav-height) + env(safe-area-inset-top, 0px) + 4px);
			height: 30px;
			padding: 0 10px;
		}
		.animate-marquee {
			animation-duration: 40s;
		}
		.live-indicator {
			padding: 3px 8px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ticker-bar {
			transition-duration: 0.2s;
			transition-timing-function: ease;
		}
		.animate-marquee {
			animation: none;
		}
	}
</style>
