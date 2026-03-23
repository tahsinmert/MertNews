<script>
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let data = { rates: {}, crypto: {} };

	let displayData = data;

	const currencies = [
		{ code: 'USD', label: 'currency.usd', icon: '🇺🇸' },
		{ code: 'EUR', label: 'currency.eur', icon: '🇪🇺' },
		{ code: 'GBP', label: 'currency.gbp', icon: '🇬🇧' }
	];

	const cryptos = [
		{ code: 'BTC', label: 'currency.btc', icon: '₿' },
		{ code: 'ETH', label: 'currency.eth', icon: 'Ξ' }
	];

	async function refreshData() {
		try {
			const res = await fetch('/api/currency');
			const newData = await res.json();
			if (newData && newData.updatedAt !== displayData.updatedAt) {
				displayData = newData;
			}
		} catch (e) {
			console.error('Grid refresh error:', e);
		}
	}

	onMount(() => {
		const interval = setInterval(refreshData, 30000);
		return () => clearInterval(interval);
	});

	/** @param {string | number | null | undefined} ch */
	function changeTone(ch) {
		if (ch == null || ch === '') return 'na';
		const n = parseFloat(String(ch));
		if (!Number.isFinite(n)) return 'na';
		if (n > 0) return 'up';
		if (n < 0) return 'down';
		return 'na';
	}

	/** @param {string | number | null | undefined} ch */
	function fmtCh(ch) {
		if (ch == null || ch === '') return '—';
		const n = parseFloat(String(ch));
		if (!Number.isFinite(n)) return '—';
		const s = n.toFixed(2);
		if (n > 0) return `+${s}%`;
		return `${s}%`;
	}
</script>

<section class="currency-section apple-gallery-strip" aria-labelledby="currency-heading">
	<div class="apple-gallery-strip-inner container">
		<div class="section-head">
			<h2 id="currency-heading" class="headline">{$t('currency.market')}</h2>
			<div class="live-tag">
				<span class="live-dot"></span>
				<span>Live</span>
			</div>
		</div>

		<div class="tile-grid">
			{#each currencies as curr}
				{@const rate = displayData.rates[curr.code]}
				{#if rate}
					<div class="rate-tile" in:fade={{ duration: 200 }}>
						<div class="tile-top">
							<span class="tile-icon" aria-hidden="true">{curr.icon}</span>
							<span class="tile-name">{$t(curr.label)}</span>
						</div>
						<div class="tile-mid">
							<div class="row">
								<span class="row-label">{$t('currency.selling')}</span>
								<span class="row-value">₺ {rate.selling.toFixed(4)}</span>
							</div>
							<div class="row">
								<span class="row-label">{$t('currency.buying')}</span>
								<span class="row-value">₺ {rate.buying.toFixed(4)}</span>
							</div>
						</div>
						<div class="tile-foot">
							<div
								class="trend"
								class:up={changeTone(rate.change) === 'up'}
								class:down={changeTone(rate.change) === 'down'}
								class:na={changeTone(rate.change) === 'na'}
							>
								<span>{changeTone(rate.change) === 'up' ? '↗' : changeTone(rate.change) === 'down' ? '↘' : '·'}</span>
								<span>{fmtCh(rate.change)}</span>
							</div>
						</div>
					</div>
				{/if}
			{/each}

			{#each cryptos as cryp}
				{@const info = displayData.crypto[cryp.code]}
				{#if info}
					<div class="rate-tile rate-tile-crypto" in:fade={{ duration: 200 }}>
						<div class="tile-top">
							<span class="crypto-badge" aria-hidden="true">{cryp.icon}</span>
							<span class="tile-name">{$t(cryp.label)}</span>
						</div>
						<div class="tile-mid crypto-prices">
							<div class="big-price">
								<span class="sym">₺</span>
								<span class="num">{info.priceTRY.toLocaleString('tr-TR')}</span>
							</div>
							<div class="sub-price">
								<span class="sym">$</span>
								<span>{info.priceUSD.toLocaleString('en-US')}</span>
							</div>
						</div>
						<div class="tile-foot">
							<div
								class="trend"
								class:up={changeTone(info.change) === 'up'}
								class:down={changeTone(info.change) === 'down'}
								class:na={changeTone(info.change) === 'na'}
							>
								<span>{changeTone(info.change) === 'up' ? '↗' : changeTone(info.change) === 'down' ? '↘' : '·'}</span>
								<span>{fmtCh(info.change)}</span>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<style>
	.currency-section {
		margin-top: 0;
		margin-bottom: 0;
		padding: 4.5rem 0 5rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.headline {
		font-family: var(--font-main);
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		line-height: 1.05;
		color: var(--fg);
		margin: 0;
	}

	.live-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: 980px;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--apple-green);
		background: rgba(52, 199, 89, 0.12);
	}

	:global([prefers-color-scheme='dark']) .live-tag {
		background: rgba(50, 215, 75, 0.15);
	}

	.live-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--apple-green);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(0.92);
		}
		50% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.tile-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
		gap: 1.25rem;
	}

	.rate-tile {
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: 18px;
		padding: 1.25rem 1.35rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: var(--apple-tile-shadow);
		transition:
			transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
			box-shadow 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.rate-tile:hover {
		transform: translateY(-3px);
		box-shadow: var(--apple-tile-shadow-hover);
	}

	.tile-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.tile-icon {
		font-size: 1.35rem;
		line-height: 1;
	}

	.crypto-badge {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--apple-blue);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		font-weight: 600;
	}

	.tile-name {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--fg);
	}

	.tile-mid {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
	}

	.row-label {
		font-size: 0.75rem;
		color: var(--apple-eyebrow);
	}

	.row-value {
		font-size: 1.05rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--fg);
		letter-spacing: -0.02em;
	}

	.crypto-prices .big-price {
		display: flex;
		align-items: baseline;
		gap: 4px;
	}

	.big-price .sym {
		font-size: 1rem;
		font-weight: 500;
		color: var(--apple-eyebrow);
	}

	.big-price .num {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--fg);
	}

	.sub-price {
		font-size: 0.8125rem;
		color: var(--apple-eyebrow);
	}

	.tile-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: auto;
		padding-top: 4px;
	}

	.trend {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.trend.up {
		color: var(--apple-green);
	}
	.trend.down {
		color: var(--apple-red);
	}

	.trend.na {
		color: var(--apple-eyebrow);
	}

	/* Apple tarzı yatay şerit — dar ekran */
	@media (max-width: 734px) {
		.tile-grid {
			display: flex;
			flex-flow: row nowrap;
			gap: 1rem;
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-snap-type: x mandatory;
			scroll-padding-inline: max(22px, env(safe-area-inset-left));
			-webkit-overflow-scrolling: touch;
			scrollbar-width: none;
			padding-bottom: 0.75rem;
			margin-inline: -6px;
			padding-inline: 6px;
		}

		.tile-grid::-webkit-scrollbar {
			display: none;
		}

		.rate-tile {
			flex: 0 0 min(78vw, 300px);
			scroll-snap-align: start;
			scroll-snap-stop: normal;
		}

		.rate-tile:hover {
			transform: none;
			box-shadow: var(--apple-tile-shadow);
		}
	}

	@media (max-width: 734px) and (prefers-reduced-motion: reduce) {
		.tile-grid {
			scroll-snap-type: none;
		}
	}

	@media (max-width: 600px) {
		.headline {
			font-size: clamp(1.65rem, 6vw, 2.25rem);
		}
	}
</style>
