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
			return { rates: {}, gold: {}, crypto: {}, reference: { usdEcb: {} }, updatedAt: null, meta: emptyMeta() };
		}
		return {
			rates: typeof raw.rates === 'object' && raw.rates ? raw.rates : {},
			gold: typeof raw.gold === 'object' && raw.gold ? raw.gold : {},
			crypto: typeof raw.crypto === 'object' && raw.crypto ? raw.crypto : {},
			reference: typeof raw.reference === 'object' && raw.reference ? raw.reference : { usdEcb: {} },
			updatedAt: raw.updatedAt ?? null,
			meta: typeof raw.meta === 'object' && raw.meta
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
			clientOverlay = normalize(await res.json());
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
		return Number(n).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
	}

	/** @param {string | null | undefined} iso */
	function fmtTime(iso) {
		if (!iso) return '—';
		try {
			return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
		} catch { return '—'; }
	}

	/** @param {string | number | null | undefined} ch */
	function fmtChange(ch) {
		if (ch == null || ch === '') return null;
		const n = parseFloat(String(ch));
		if (!Number.isFinite(n)) return null;
		return n > 0 ? `+${n.toFixed(2)}%` : `${n.toFixed(2)}%`;
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

<main class="fin">
	<header class="fin-header">
		<div class="fin-header-inner container">
			<h1 class="fin-title">{$t('nav.finance')}</h1>
			<p class="fin-lede">{$t('finance.subtitle')}</p>

			<div class="fin-status">
				<span class="fin-live">
					<span class="fin-dot" aria-hidden="true"></span>
					{$t('finance.live')}
				</span>
				<span class="fin-updated">{$t('finance.updated')} · {updatedLabel}</span>
				<button type="button" class="fin-refresh" disabled={refreshing} on:click={refresh}>
					{refreshing ? $t('finance.loading') : $t('finance.refresh')}
				</button>
			</div>

			{#if financeData.meta.tcmbBulletinDate}
				<p class="fin-tcmb">
					TCMB: {financeData.meta.tcmbBulletinDate}
					{#if financeData.meta.tcmbPreviousDate}
						· {$t('finance.tcmbPrev')}: {financeData.meta.tcmbPreviousDate}
					{/if}
				</p>
			{/if}

			{#if hasErrors}
				<div class="fin-alert" role="alert">
					<p><strong>{$t('finance.dataIssues')}</strong></p>
					<ul>
						{#each financeData.meta.errors as err}
							<li><strong>{err.section}:</strong> {err.message}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</header>

	<!-- Forex -->
	<section class="fin-sec" aria-labelledby="fin-forex">
		<div class="container">
			<h2 id="fin-forex" class="fin-h2">{$t('finance.forex')}</h2>
			{#if forexCodes.length === 0}
				<p class="fin-empty">{$t('finance.noForex')}</p>
			{:else}
				<div class="fin-table" role="table">
					<div class="fin-thead" role="row">
						<span class="fin-th fin-th--cur">{$t('finance.currency') ?? 'Currency'}</span>
						<span class="fin-th">{$t('finance.sell')}</span>
						<span class="fin-th">{$t('finance.buy')}</span>
						<span class="fin-th fin-th--end">{$t('finance.change1d')}</span>
					</div>
					{#each forexCodes as code}
						{@const rate = financeData.rates[code]}
						{@const labelKey = `currency.${code.toLowerCase()}`}
						{@const lbl = $t(labelKey)}
						{#if rate && (rate.selling > 0 || rate.buying > 0)}
							<div class="fin-tr" role="row">
								<div class="fin-td fin-td--cur">
									<span class="fin-code">{code}</span>
									<span class="fin-name">{lbl === labelKey ? code : lbl}</span>
									{#if rate.unit && rate.unit > 1}
										<span class="fin-unit">{$t('finance.perUnit').replace('{n}', String(rate.unit))}</span>
									{/if}
								</div>
								<div class="fin-td">
									<span class="fin-price">₺{fmtFx(rate.selling)}</span>
								</div>
								<div class="fin-td">
									<span class="fin-price fin-price--dim">₺{fmtFx(rate.buying)}</span>
								</div>
								<div class="fin-td fin-td--end">
									<span
										class="fin-chg"
										class:fin-chg--up={changeTone(rate.change) === 'up'}
										class:fin-chg--down={changeTone(rate.change) === 'down'}
									>
										{fmtChange(rate.change) ?? '—'}
									</span>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Crypto -->
	{#if cryptoCodes.length > 0}
		<section class="fin-sec" aria-labelledby="fin-crypto">
			<div class="container">
				<h2 id="fin-crypto" class="fin-h2">{$t('finance.crypto')}</h2>
				<div class="fin-table" role="table">
					<div class="fin-thead" role="row">
						<span class="fin-th fin-th--cur">Token</span>
						<span class="fin-th">₺ TRY</span>
						<span class="fin-th">$ USD</span>
						<span class="fin-th fin-th--end">{$t('finance.change1d')}</span>
					</div>
					{#each cryptoCodes as code}
						{@const info = financeData.crypto[code]}
						{@const labelKey = `currency.${code.toLowerCase()}`}
						{@const lbl = $t(labelKey)}
						{#if info}
							<div class="fin-tr" role="row">
								<div class="fin-td fin-td--cur">
									<span class="fin-code">{code}</span>
									<span class="fin-name">{lbl === labelKey ? code : lbl}</span>
									{#if info.pair}
										<span class="fin-unit">{info.pair}</span>
									{/if}
								</div>
								<div class="fin-td">
									<span class="fin-price">₺{Number(info.priceTRY).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
								</div>
								<div class="fin-td">
									<span class="fin-price fin-price--dim">
										{#if info.priceUSD != null && Number.isFinite(Number(info.priceUSD))}
											${Number(info.priceUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}
										{:else}—{/if}
									</span>
								</div>
								<div class="fin-td fin-td--end">
									<span
										class="fin-chg"
										class:fin-chg--up={changeTone(info.change) === 'up'}
										class:fin-chg--down={changeTone(info.change) === 'down'}
									>
										{fmtChange(info.change) ?? '—'}
									</span>
								</div>
							</div>
						{/if}
					{/each}
				</div>
				{#if financeData.crypto[cryptoCodes[0]]?.source}
					<p class="fin-note">{financeData.crypto[cryptoCodes[0]].source} · 24h</p>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Gold -->
	{#if Object.keys(financeData.gold).length > 0}
		<section class="fin-sec" aria-labelledby="fin-gold">
			<div class="container">
				<h2 id="fin-gold" class="fin-h2">{$t('finance.goldSection')}</h2>
				<p class="fin-note">{$t('finance.goldPaxgNote')}</p>
				<div class="fin-table" role="table">
					{#each Object.entries(financeData.gold) as [type, info] (type)}
						{@const titleKey = goldRowTitle(type)}
						{#if info && titleKey}
							<div class="fin-tr" role="row">
								<div class="fin-td fin-td--cur">
									<span class="fin-code">{type === 'GRAM_TRY' ? 'Au' : 'XAU'}</span>
									<span class="fin-name">{$t(titleKey)}</span>
									{#if info.source}
										<span class="fin-unit">{info.source}</span>
									{/if}
								</div>
								<div class="fin-td">
									<span class="fin-price">{info.symbol}{Number(String(info.price).replace(',', '.')).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
								</div>
								<div class="fin-td fin-td--end">
									<span
										class="fin-chg"
										class:fin-chg--up={changeTone(info.change) === 'up'}
										class:fin-chg--down={changeTone(info.change) === 'down'}
									>
										{fmtChange(info.change) ?? '—'}
									</span>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ECB Reference -->
	{#if ecbRates && Object.keys(ecbRates).length > 0}
		<section class="fin-sec" aria-labelledby="fin-ecb">
			<div class="container">
				<h2 id="fin-ecb" class="fin-h2">{$t('finance.referenceEcb')}</h2>
				<p class="fin-note">
					{$t('finance.referenceEcbNote')}
					{#if ecbDate} · {ecbDate}{/if}
				</p>
				<div class="fin-ecb" role="table">
					{#each Object.entries(ecbRates) as [cur, val]}
						<div class="fin-ecb-row">
							<span class="fin-ecb-cur">{cur}</span>
							<span class="fin-ecb-val">{Number(val).toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Sources -->
	{#if financeData.meta.sources.length > 0}
		<section class="fin-sec fin-sec--last" aria-labelledby="fin-src">
			<div class="container">
				<h2 id="fin-src" class="fin-h2 fin-h2--sm">{$t('finance.sourcesTitle')}</h2>
				<ul class="fin-sources">
					{#each financeData.meta.sources as s}
						<li>
							<strong>{s.name}</strong>
							{#if s.url}
								· <a href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a>
							{/if}
							<span class="fin-src-time">{fmtTime(s.fetchedAt)}</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<footer class="fin-foot container">
		<p class="fin-disclaimer">{$t('finance.disclaimer')}</p>
	</footer>
</main>

<style>
	.fin {
		min-height: 100vh;
		padding-top: var(--nav-height);
	}

	/* ── Header ── */
	.fin-header {
		padding: 4rem 0 2.5rem;
		border-bottom: 1px solid var(--card-border);
	}

	.fin-header-inner { max-width: 820px; }

	.fin-title {
		font-size: clamp(2.25rem, 5.5vw, 3.5rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.06;
		margin: 0 0 0.75rem;
		color: var(--fg);
	}

	.fin-lede {
		font-size: 1.125rem;
		line-height: 1.5;
		color: var(--muted);
		max-width: 50ch;
		margin: 0 0 1.5rem;
	}

	.fin-status {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1.25rem;
	}

	.fin-live {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--apple-green);
	}

	.fin-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}

	.fin-updated {
		font-size: 0.8125rem;
		color: var(--muted);
	}

	.fin-refresh {
		margin-left: auto;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--apple-blue);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}

	.fin-refresh:hover:not(:disabled) { text-decoration: underline; }
	.fin-refresh:disabled { opacity: 0.4; cursor: default; }

	.fin-tcmb {
		margin: 1rem 0 0;
		font-size: 0.75rem;
		color: var(--muted);
	}

	.fin-alert {
		margin: 1.25rem 0 0;
		padding: 0.75rem 1rem;
		font-size: 0.8125rem;
		line-height: 1.5;
		border-radius: 8px;
		color: var(--fg);
		background: color-mix(in srgb, var(--apple-red, #ff3b30) 8%, transparent);
		max-width: 48rem;
	}

	.fin-alert ul { margin: 0.5rem 0 0; padding-left: 1.15rem; }

	/* ── Sections ── */
	.fin-sec {
		padding: 2.5rem 0;
		border-bottom: 1px solid var(--card-border);
	}

	.fin-sec--last { border-bottom: none; }

	.fin-h2 {
		font-size: 1.375rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		margin: 0 0 1rem;
		color: var(--fg);
	}

	.fin-h2--sm {
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}

	.fin-note {
		font-size: 0.8125rem;
		color: var(--muted);
		margin: -0.25rem 0 1rem;
		line-height: 1.5;
	}

	.fin-empty {
		color: var(--muted);
		font-size: 0.9375rem;
	}

	/* ── Table layout ── */
	.fin-table {
		border-top: 1px solid var(--card-border);
	}

	.fin-thead {
		display: grid;
		grid-template-columns: minmax(0, 200px) 1fr 1fr auto;
		gap: 1rem;
		padding: 0.625rem 0;
		border-bottom: 1px solid var(--card-border);
	}

	.fin-th {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.fin-th--cur { min-width: 0; }
	.fin-th--end { text-align: right; }

	.fin-tr {
		display: grid;
		grid-template-columns: minmax(0, 200px) 1fr 1fr auto;
		gap: 1rem;
		align-items: center;
		padding: 0.875rem 0;
		border-bottom: 1px solid var(--card-border);
	}

	.fin-tr:last-child { border-bottom: none; }

	.fin-td { min-width: 0; }
	.fin-td--cur { display: flex; flex-direction: column; gap: 1px; }
	.fin-td--end { text-align: right; }

	.fin-code {
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		font-variant-numeric: tabular-nums;
	}

	.fin-name {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.fin-unit {
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--apple-blue);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.fin-price {
		font-size: 0.9375rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.01em;
	}

	.fin-price--dim {
		color: var(--muted);
		font-weight: 500;
	}

	.fin-chg {
		font-size: 0.8125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--muted);
	}

	.fin-chg--up { color: var(--apple-green); }
	.fin-chg--down { color: var(--apple-red); }

	/* ── ECB grid ── */
	.fin-ecb {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 0;
	}

	.fin-ecb-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.5rem 0.75rem 0.5rem 0;
		border-bottom: 1px solid var(--card-border);
		font-size: 0.8125rem;
	}

	.fin-ecb-cur {
		font-weight: 600;
		color: var(--fg);
	}

	.fin-ecb-val {
		font-variant-numeric: tabular-nums;
		color: var(--muted);
	}

	/* ── Sources / footer ── */
	.fin-sources {
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--muted);
	}

	.fin-sources li { margin-bottom: 0.5rem; }
	.fin-sources a { color: var(--apple-blue); word-break: break-all; }

	.fin-src-time {
		display: block;
		font-size: 0.6875rem;
		opacity: 0.7;
	}

	.fin-foot {
		padding: 2rem 0 4rem;
	}

	.fin-disclaimer {
		font-size: 0.6875rem;
		line-height: 1.5;
		color: var(--muted);
		max-width: 48ch;
		margin: 0;
	}

	/* ── Mobile ── */
	@media (max-width: 734px) {
		.fin-header { padding: 3rem 0 2rem; }

		.fin-sec { padding: 2rem 0; }

		.fin-thead,
		.fin-tr {
			grid-template-columns: minmax(0, 120px) 1fr 1fr auto;
			gap: 0.5rem;
		}

		.fin-ecb {
			grid-template-columns: repeat(2, 1fr);
		}

		.fin-foot {
			padding: 1.5rem 0 calc(2rem + env(safe-area-inset-bottom, 0px));
		}
	}

	@media (max-width: 480px) {
		.fin-thead,
		.fin-tr {
			grid-template-columns: 1fr 1fr auto;
		}

		.fin-th--cur,
		.fin-td--cur .fin-name,
		.fin-td--cur .fin-unit {
			display: none;
		}

		.fin-td--cur {
			flex-direction: row;
			gap: 0;
		}
	}
</style>
