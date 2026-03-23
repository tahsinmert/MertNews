<script>
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { sortForexCodes, sortCryptoCodes } from '$lib/financeDisplay.js';

	/** @type {import('./$types').PageData} */
	export let data;

	const emptyMeta = () => ({
		sources: [],
		errors: [],
		tcmbBulletinDate: null,
		tcmbPreviousDate: null,
		methodology: {}
	});

	/** @param {any} raw */
	function normalize(raw) {
		if (!raw || typeof raw !== 'object') {
			return {
				rates: {},
				gold: {},
				crypto: {},
				reference: { usdEcb: {} },
				updatedAt: null,
				meta: emptyMeta()
			};
		}
		return {
			rates: typeof raw.rates === 'object' && raw.rates ? raw.rates : {},
			gold: typeof raw.gold === 'object' && raw.gold ? raw.gold : {},
			crypto: typeof raw.crypto === 'object' && raw.crypto ? raw.crypto : {},
			reference:
				typeof raw.reference === 'object' && raw.reference
					? raw.reference
					: { usdEcb: {} },
			updatedAt: raw.updatedAt ?? null,
			meta:
				typeof raw.meta === 'object' && raw.meta
					? {
							sources: Array.isArray(raw.meta.sources) ? raw.meta.sources : [],
							errors: Array.isArray(raw.meta.errors) ? raw.meta.errors : [],
							tcmbBulletinDate: raw.meta.tcmbBulletinDate ?? null,
							tcmbPreviousDate: raw.meta.tcmbPreviousDate ?? null,
							methodology: raw.meta.methodology ?? {}
						}
					: emptyMeta()
		};
	}

	let clientOverlay = null;

	$: serverNorm = normalize(data?.currencyData);
	$: financeData = clientOverlay ?? serverNorm;

	$: data, (clientOverlay = null);

	$: forexCodes = sortForexCodes(Object.keys(financeData.rates));
	$: cryptoCodes = sortCryptoCodes(Object.keys(financeData.crypto));
	$: ecbRates =
		financeData.reference?.usdEcb?.rates && typeof financeData.reference.usdEcb.rates === 'object'
			? financeData.reference.usdEcb.rates
			: null;
	$: ecbDate = financeData.reference?.usdEcb?.date ?? null;

	let refreshing = false;

	async function refresh() {
		refreshing = true;
		try {
			const res = await fetch('/api/currency');
			if (!res.ok) throw new Error(String(res.status));
			const j = await res.json();
			clientOverlay = normalize(j);
		} catch (e) {
			console.error('Finance refresh:', e);
		} finally {
			refreshing = false;
		}
	}

	onMount(() => {
		refresh();
		const id = setInterval(refresh, 90_000);
		return () => clearInterval(id);
	});

	/** @param {number} n @param {number} [d] */
	function fmtFx(n, d = 4) {
		return Number(n).toLocaleString('tr-TR', {
			minimumFractionDigits: d,
			maximumFractionDigits: d
		});
	}

	/** @param {string | null | undefined} iso */
	function fmtTime(iso) {
		if (!iso) return '—';
		try {
			const d = new Date(iso);
			return d.toLocaleString(undefined, {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return '—';
		}
	}

	/** @param {string | number | null | undefined} ch */
	function fmtChange(ch) {
		if (ch == null || ch === '') return null;
		const n = parseFloat(String(ch));
		if (!Number.isFinite(n)) return null;
		const s = n.toFixed(2);
		if (n > 0) return `+${s}%`;
		return `${s}%`;
	}

	/** @param {string | number | null | undefined} ch */
	function changeTone(ch) {
		if (ch == null || ch === '') return 'na';
		const n = parseFloat(String(ch));
		if (!Number.isFinite(n)) return 'na';
		if (n > 0) return 'up';
		if (n < 0) return 'down';
		return 'na';
	}

	/** @param {string} type */
	function goldRowTitle(type) {
		if (type === 'GRAM_TRY') return 'finance.goldGramSpot';
		if (type === 'XAU_USD_OZ') return 'finance.goldUsdOz';
		return '';
	}

	$: updatedLabel = fmtTime(financeData.updatedAt);
	$: hasErrors = financeData.meta.errors.length > 0;
</script>

<svelte:head>
	<title>{$t('nav.finance')} | MertNews</title>
</svelte:head>

<div class="fin">
	<header class="fin__hero">
		<div class="fin__hero-inner container">
			<p class="fin__eyebrow">{$t('currency.market')}</p>
			<h1 class="fin__title">{$t('nav.finance')}</h1>
			<p class="fin__lede">{$t('finance.subtitle')}</p>

			<div class="fin__meta">
				<span class="fin__pill">
					<span class="fin__dot"></span>
					{$t('finance.live')}
				</span>
				<span class="fin__time">{$t('finance.updated')} · {updatedLabel}</span>
				<button type="button" class="fin__refresh" disabled={refreshing} on:click={refresh}>
					{refreshing ? $t('finance.loading') : $t('finance.refresh')}
				</button>
			</div>

			{#if financeData.meta.tcmbBulletinDate}
				<p class="fin__tcmb-meta">
					TCMB: {financeData.meta.tcmbBulletinDate}
					{#if financeData.meta.tcmbPreviousDate}
						· {$t('finance.tcmbPrev')}: {financeData.meta.tcmbPreviousDate}
					{/if}
				</p>
			{/if}

			{#if hasErrors}
				<div class="fin__notice fin__notice--error" role="alert">
					<p class="fin__notice-title">{$t('finance.dataIssues')}</p>
					<ul>
						{#each financeData.meta.errors as err}
							<li><strong>{err.section}:</strong> {err.message}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</header>

	<section class="fin__block apple-gallery-strip" aria-labelledby="fin-forex">
		<div class="fin__block-inner container">
			<h2 id="fin-forex" class="fin__h2">{$t('finance.forex')}</h2>
			{#if forexCodes.length === 0}
				<p class="fin__empty">{$t('finance.noForex')}</p>
			{:else}
				<div class="fin__list" role="list">
					{#each forexCodes as code}
						{@const rate = financeData.rates[code]}
						{@const labelKey = `currency.${code.toLowerCase()}`}
						{@const lbl = $t(labelKey)}
						{#if rate && (rate.selling > 0 || rate.buying > 0)}
							<div class="fin__row" role="listitem">
								<div class="fin__row-main">
									<span class="fin__code">{code}</span>
									<span class="fin__label">{lbl === labelKey ? code : lbl}</span>
									{#if rate.unit && rate.unit > 1}
										<span class="fin__unit">{$t('finance.perUnit').replace('{n}', String(rate.unit))}</span>
									{/if}
								</div>
								<div class="fin__row-prices">
									<div class="fin__pair">
										<span class="fin__pair-k">{$t('finance.sell')}</span>
										<span class="fin__pair-v">₺{fmtFx(rate.selling)}</span>
									</div>
									<div class="fin__pair">
										<span class="fin__pair-k">{$t('finance.buy')}</span>
										<span class="fin__pair-v fin__pair-v--muted">₺{fmtFx(rate.buying)}</span>
									</div>
								</div>
								<div
									class="fin__chg"
									class:fin__chg--up={changeTone(rate.change) === 'up'}
									class:fin__chg--down={changeTone(rate.change) === 'down'}
									class:fin__chg--na={changeTone(rate.change) === 'na'}
								>
									<span class="fin__chg-label">{$t('finance.change1d')}</span>
									{#if fmtChange(rate.change)}
										{fmtChange(rate.change)}
									{:else}
										—
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</section>

	{#if cryptoCodes.length > 0}
		<section class="fin__block" aria-labelledby="fin-crypto">
			<div class="fin__block-inner container">
				<h2 id="fin-crypto" class="fin__h2">{$t('finance.crypto')}</h2>
				<div class="fin__cards">
					{#each cryptoCodes as code}
						{@const info = financeData.crypto[code]}
						{@const labelKey = `currency.${code.toLowerCase()}`}
						{@const lbl = $t(labelKey)}
						{#if info}
							<article class="fin__card">
								<div class="fin__card-top">
									<div>
										<span class="fin__code">{code}</span>
										{#if info.pair}
											<p class="fin__pair-tag">{info.pair}</p>
										{/if}
									</div>
									<div
										class="fin__chg fin__chg--sm"
										class:fin__chg--up={changeTone(info.change) === 'up'}
										class:fin__chg--down={changeTone(info.change) === 'down'}
										class:fin__chg--na={changeTone(info.change) === 'na'}
									>
										{fmtChange(info.change) ?? '—'}
									</div>
								</div>
								<p class="fin__card-name">{lbl === labelKey ? code : lbl}</p>
								<p class="fin__card-price">
									₺{Number(info.priceTRY).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
								</p>
								<p class="fin__card-sub">
									{#if info.priceUSD != null && Number.isFinite(Number(info.priceUSD))}
										${Number(info.priceUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}
									{:else}
										—
									{/if}
								</p>
								{#if info.source}
									<p class="fin__src">{info.source}{#if info.source === 'Binance'} · 24h{/if}</p>
								{/if}
							</article>
						{/if}
					{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if Object.keys(financeData.gold).length > 0}
		<section class="fin__block apple-gallery-strip" aria-labelledby="fin-gold">
			<div class="fin__block-inner container">
				<h2 id="fin-gold" class="fin__h2">{$t('finance.goldSection')}</h2>
				<p class="fin__gold-note">{$t('finance.goldPaxgNote')}</p>
				<div class="fin__list fin__list--gold" role="list">
					{#each Object.entries(financeData.gold) as [type, info] (type)}
						{@const titleKey = goldRowTitle(type)}
						{#if info && titleKey}
							<div class="fin__row fin__row--gold" role="listitem">
								<div class="fin__row-main">
									<span class="fin__code">{type === 'GRAM_TRY' ? 'Au' : 'XAU'}</span>
									<span class="fin__label">{$t(titleKey)}</span>
									{#if info.source}
										<span class="fin__src fin__src--inline">{info.source}</span>
									{/if}
								</div>
								<p class="fin__gold-price">
									{info.symbol}{Number(String(info.price).replace(',', '.')).toLocaleString('tr-TR', {
										maximumFractionDigits: 2
									})}
								</p>
								<div
									class="fin__chg"
									class:fin__chg--up={changeTone(info.change) === 'up'}
									class:fin__chg--down={changeTone(info.change) === 'down'}
									class:fin__chg--na={changeTone(info.change) === 'na'}
								>
									{fmtChange(info.change) ?? '—'}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if ecbRates && Object.keys(ecbRates).length > 0}
		<section class="fin__block" aria-labelledby="fin-ecb">
			<div class="fin__block-inner container">
				<h2 id="fin-ecb" class="fin__h2">{$t('finance.referenceEcb')}</h2>
				<p class="fin__gold-note">{$t('finance.referenceEcbNote')}</p>
				{#if ecbDate}
					<p class="fin__ecb-date">{ecbDate}</p>
				{/if}
				<div class="fin__ecb-grid">
					{#each Object.entries(ecbRates) as [cur, val]}
						<div class="fin__ecb-cell">
							<span class="fin__ecb-cur">{cur}</span>
							<span class="fin__ecb-val">{Number(val).toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if financeData.meta.sources.length > 0}
		<section class="fin__sources container" aria-labelledby="fin-src">
			<h2 id="fin-src" class="fin__h2 fin__h2--sm">{$t('finance.sourcesTitle')}</h2>
			<ul class="fin__src-list">
				{#each financeData.meta.sources as s}
					<li>
						<strong>{s.name}</strong>
						{#if s.url}
							· <a href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a>
						{/if}
						<span class="fin__src-time">{fmtTime(s.fetchedAt)}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<footer class="fin__foot container">
		<p class="fin__disclaimer">{$t('finance.disclaimer')}</p>
	</footer>
</div>

<style>
	.fin {
		min-height: 100vh;
		padding-top: var(--nav-height);
		background: var(--bg);
		color: var(--fg);
	}

	.fin__hero {
		padding: 3.25rem 0 2.5rem;
		border-bottom: 1px solid var(--card-border);
	}

	.fin__hero-inner {
		max-width: var(--apple-container);
	}

	.fin__eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--apple-eyebrow);
		margin: 0 0 0.5rem;
	}

	.fin__title {
		font-family: var(--font-main);
		font-size: clamp(2.25rem, 6vw, 3.25rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		line-height: 1.05;
		margin: 0 0 0.75rem;
	}

	.fin__lede {
		font-size: 1.0625rem;
		line-height: 1.45;
		color: var(--apple-eyebrow);
		max-width: 42rem;
		margin: 0 0 1.75rem;
		font-weight: 400;
	}

	.fin__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1.25rem;
	}

	.fin__pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--apple-green);
		padding: 5px 12px;
		border-radius: 980px;
		background: rgba(52, 199, 89, 0.1);
	}

	:global([prefers-color-scheme='dark']) .fin__pill {
		background: rgba(50, 215, 75, 0.14);
	}

	.fin__dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--apple-green);
		animation: fin-pulse 2.2s ease-in-out infinite;
	}

	@keyframes fin-pulse {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 1;
		}
	}

	.fin__time {
		font-size: 0.875rem;
		color: var(--apple-eyebrow);
	}

	.fin__refresh {
		margin-left: auto;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--apple-blue);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.6rem 0.75rem;
		min-height: 44px;
		border-radius: 8px;
		transition: opacity 0.2s ease;
	}

	.fin__refresh:hover:not(:disabled) {
		opacity: 0.75;
	}

	.fin__refresh:disabled {
		opacity: 0.45;
		cursor: default;
	}

	.fin__tcmb-meta {
		margin: 1rem 0 0;
		font-size: 0.8125rem;
		color: var(--apple-eyebrow);
	}

	.fin__notice {
		margin: 1.25rem 0 0;
		padding: 0.85rem 1rem;
		font-size: 0.875rem;
		line-height: 1.45;
		border-radius: 10px;
		max-width: 48rem;
	}

	.fin__notice--error {
		color: var(--fg);
		background: rgba(255, 59, 48, 0.08);
		border: 1px solid rgba(255, 59, 48, 0.22);
	}

	:global([prefers-color-scheme='dark']) .fin__notice--error {
		background: rgba(255, 69, 58, 0.12);
		border-color: rgba(255, 69, 58, 0.28);
	}

	.fin__notice-title {
		margin: 0 0 0.5rem;
		font-weight: 600;
	}

	.fin__notice ul {
		margin: 0;
		padding-left: 1.15rem;
	}

	.fin__block {
		padding: 3rem 0;
	}

	.fin__block-inner {
		max-width: var(--apple-container);
	}

	.fin__h2 {
		font-family: var(--font-main);
		font-size: clamp(1.5rem, 3vw, 1.85rem);
		font-weight: 600;
		letter-spacing: -0.035em;
		margin: 0 0 1.5rem;
	}

	.fin__h2--sm {
		font-size: 1.125rem;
		margin-bottom: 0.75rem;
	}

	.fin__empty {
		color: var(--apple-eyebrow);
		font-size: 1rem;
		margin: 0;
	}

	.fin__list {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--card-border);
	}

	.fin__row {
		display: grid;
		grid-template-columns: minmax(0, 180px) minmax(0, 1fr) auto;
		gap: 1rem 1.25rem;
		align-items: center;
		padding: 1.15rem 0;
		border-bottom: 1px solid var(--card-border);
	}

	.fin__row--gold {
		grid-template-columns: minmax(0, 1fr) auto auto;
	}

	.fin__row-main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.fin__code {
		font-size: 1.0625rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}

	.fin__label {
		font-size: 0.8125rem;
		color: var(--apple-eyebrow);
	}

	.fin__unit {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--apple-blue);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.fin__row-prices {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.75rem;
	}

	.fin__pair {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.fin__pair-k {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--apple-eyebrow);
	}

	.fin__pair-v {
		font-size: 1.0625rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}

	.fin__pair-v--muted {
		color: var(--apple-eyebrow);
		font-weight: 500;
	}

	.fin__chg {
		font-size: 0.875rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		min-width: 5rem;
		text-align: right;
		display: flex;
		flex-direction: column;
		gap: 2px;
		align-items: flex-end;
	}

	.fin__chg-label {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--apple-eyebrow);
	}

	.fin__chg--sm {
		font-size: 0.8125rem;
		min-width: auto;
	}

	.fin__chg--up {
		color: var(--apple-green);
	}

	.fin__chg--down {
		color: var(--apple-red);
	}

	.fin__chg--na {
		color: var(--apple-eyebrow);
	}

	.fin__cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1rem;
	}

	.fin__card {
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: 16px;
		padding: 1.25rem 1.35rem;
		box-shadow: var(--apple-tile-shadow);
	}

	.fin__card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.35rem;
	}

	.fin__pair-tag {
		font-size: 0.6875rem;
		color: var(--apple-eyebrow);
		margin: 0.15rem 0 0;
		font-family: ui-monospace, monospace;
	}

	.fin__card-name {
		font-size: 0.8125rem;
		color: var(--apple-eyebrow);
		margin: 0 0 0.5rem;
	}

	.fin__card-price {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.fin__card-sub {
		font-size: 0.875rem;
		color: var(--apple-eyebrow);
		margin: 0.25rem 0 0;
		font-variant-numeric: tabular-nums;
	}

	.fin__src,
	.fin__src--inline {
		font-size: 0.6875rem;
		color: var(--apple-eyebrow);
		margin: 0.5rem 0 0;
		line-height: 1.3;
	}

	.fin__src--inline {
		margin: 0.25rem 0 0;
	}

	.fin__gold-note {
		font-size: 0.8125rem;
		line-height: 1.45;
		color: var(--apple-eyebrow);
		max-width: 44rem;
		margin: -0.5rem 0 1.25rem;
	}

	.fin__gold-price {
		font-size: 1.125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		margin: 0;
		text-align: right;
	}

	.fin__ecb-date {
		font-size: 0.8125rem;
		color: var(--apple-eyebrow);
		margin: -0.5rem 0 1rem;
	}

	.fin__ecb-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.65rem 1rem;
	}

	.fin__ecb-cell {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--card-border);
		font-size: 0.875rem;
	}

	.fin__ecb-cur {
		font-weight: 600;
		color: var(--fg);
	}

	.fin__ecb-val {
		font-variant-numeric: tabular-nums;
		color: var(--apple-eyebrow);
	}

	.fin__sources {
		padding: 0 0 2rem;
		max-width: var(--apple-container);
	}

	.fin__src-list {
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--apple-eyebrow);
	}

	.fin__src-list li {
		margin-bottom: 0.65rem;
	}

	.fin__src-list a {
		color: var(--apple-blue);
		word-break: break-all;
		opacity: 1;
	}

	.fin__src-time {
		display: block;
		font-size: 0.6875rem;
		opacity: 0.75;
		margin-top: 0.15rem;
	}

	.fin__foot {
		padding: 2.5rem 0 4rem;
		max-width: var(--apple-container);
	}

	.fin__disclaimer {
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--apple-eyebrow);
		max-width: 48ch;
		margin: 0;
	}

	@media (max-width: 734px) {
		.fin__hero {
			padding: 2rem 0 1.5rem;
		}

		.fin__block {
			padding: 2rem 0;
		}

		.fin__row {
			grid-template-columns: 1fr;
			gap: 0.75rem;
			padding: 1rem 0;
		}

		.fin__chg {
			align-items: flex-start;
			text-align: left;
		}

		.fin__row--gold .fin__gold-price {
			text-align: left;
		}

		.fin__cards {
			grid-template-columns: 1fr;
		}

		.fin__ecb-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.fin__foot {
			padding: 1.5rem 0 calc(2rem + env(safe-area-inset-bottom, 0px));
		}
	}
</style>
