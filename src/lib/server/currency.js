import { XMLParser } from 'fast-xml-parser';
import { sortForexCodes } from '$lib/financeDisplay.js';

/** Sunucu tarafı kısa önbellek (TCMB / borsa dostu) */
let memoryCache = { payload: /** @type {null | Awaited<ReturnType<typeof fetchCurrencyDataUncached>>} */ (null), at: 0 };
const CACHE_MS = 45_000;

/**
 * @param {unknown} v
 * @returns {number}
 */
function parseTcmbNumber(v) {
	if (v == null || v === '') return 0;
	if (typeof v === 'number' && !Number.isNaN(v)) return v;
	const s = String(v).trim().replace(',', '.');
	const n = parseFloat(s);
	return Number.isFinite(n) ? n : 0;
}

/**
 * @param {unknown} raw
 * @returns {Record<string, unknown>[]}
 */
function normalizeCurrencyArray(raw) {
	if (raw == null) return [];
	return Array.isArray(raw) ? raw : [raw];
}

/**
 * TCMB bülten tarihi "DD.MM.YYYY"
 * @param {string} tarihStr
 * @returns {Date}
 */
function parseTcmbBulletinDate(tarihStr) {
	const [d, m, y] = tarihStr.split('.').map((x) => parseInt(x, 10));
	return new Date(Date.UTC(y, m - 1, d));
}

/**
 * @param {Date} d
 * @returns {Date}
 */
function previousUtcCalendarDay(d) {
	const x = new Date(d.getTime());
	x.setUTCDate(x.getUTCDate() - 1);
	return x;
}

/**
 * Cuma'ya kadar geri sar (TCMB hafta sonu yayınlamaz)
 * @param {Date} d
 * @returns {Date}
 */
function previousBusinessUtcDay(d) {
	let x = previousUtcCalendarDay(d);
	while (x.getUTCDay() === 0 || x.getUTCDay() === 6) {
		x = previousUtcCalendarDay(x);
	}
	return x;
}

/**
 * @param {Date} d
 * @returns {string}
 */
function tcmbArchiveUrl(d) {
	const dd = String(d.getUTCDate()).padStart(2, '0');
	const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
	const yyyy = d.getUTCFullYear();
	const folder = `${yyyy}${mm}`;
	const file = `${dd}${mm}${yyyy}.xml`;
	return `https://www.tcmb.gov.tr/kurlar/${folder}/${file}`;
}

/**
 * @param {string} xml
 * @returns {{ currencies: Record<string, unknown>[], bulletinDate: string | null, bulletinNo: string | null }}
 */
function parseTcmbXml(xml) {
	const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
	const jsonObj = parser.parse(xml);
	const root = jsonObj.Tarih_Date;
	const rawCurrencies = root?.Currency;
	const currencies = normalizeCurrencyArray(rawCurrencies);
	const bulletinDate = root?.Tarih ?? root?.Date ?? null;
	const bulletinNo = root?.Bulten_No ?? null;
	return { currencies, bulletinDate, bulletinNo };
}

/**
 * @param {Record<string, unknown>} curr
 * @returns {{ code: string, buying: number, selling: number, unit: number } | null}
 */
function rowFromTcmbCurrency(curr) {
	const code = String(curr.Kod || curr.CurrencyCode || '');
	if (!code) return null;
	const unit = Math.max(1, parseTcmbNumber(curr.Unit) || 1);
	const buying = parseTcmbNumber(curr.ForexBuying);
	const selling = parseTcmbNumber(curr.ForexSelling);
	if (buying <= 0 && selling <= 0) return null;
	return { code, buying, selling, unit };
}

/**
 * @param {Record<string, unknown>[]} currencies
 * @returns {Record<string, { buying: number, selling: number, unit: number }>}
 */
function indexTcmbByCode(currencies) {
	/** @type {Record<string, { buying: number, selling: number, unit: number }>} */
	const map = {};
	for (const c of currencies) {
		const row = rowFromTcmbCurrency(c);
		if (row) map[row.code] = { buying: row.buying, selling: row.selling, unit: row.unit };
	}
	return map;
}

/**
 * @param {number} todaySell
 * @param {number} prevSell
 * @returns {string | null}
 */
function pctChange(todaySell, prevSell) {
	if (prevSell <= 0 || todaySell <= 0) return null;
	const p = ((todaySell - prevSell) / prevSell) * 100;
	if (!Number.isFinite(p)) return null;
	return p.toFixed(2);
}

/** @param {number} ms */
function fetchTimeout(ms) {
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
		return AbortSignal.timeout(ms);
	}
	const c = new AbortController();
	setTimeout(() => c.abort(), ms);
	return c.signal;
}

/**
 * @param {string} symbol
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function binanceTicker24h(symbol) {
	try {
		const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
			headers: { Accept: 'application/json' },
			signal: fetchTimeout(12_000)
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

/**
 * CoinGecko — yalnızca Binance başarısız olduğunda (gerçek piyasa verisi)
 */
async function coingeckoBtcEth() {
	try {
		const res = await fetch(
			'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=usd,try&include_24hr_change=true',
			{ headers: { Accept: 'application/json' }, signal: fetchTimeout(12_000) }
		);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

/**
 * ECB döviz kurları (Frankfurter — ücretsiz, resmi ECB)
 */
async function frankfurterUsdRates() {
	try {
		const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,CHF,JPY,SEK,NOK,DKK,PLN,CZK', {
			headers: { Accept: 'application/json' },
			signal: fetchTimeout(10_000)
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

/** Binance’te sık kullanılan TRY çiftleri (borsanın sunduğu gerçek işlem fiyatları) */
const BINANCE_TRY_SYMBOLS = [
	'BTCTRY',
	'ETHTRY',
	'USDTTRY',
	'XRPTRY',
	'SOLTRY',
	'ADATRY',
	'AVAXTRY',
	'DOTTRY',
	'LINKTRY',
	'LTCTRY',
	'NEOTRY',
	'MATICTRY',
	'ATOMTRY'
];

/**
 * @param {typeof memoryCache.payload} meta
 * @param {string} id
 * @param {string} name
 * @param {string} url
 */
function pushSource(meta, id, name, url) {
	if (!meta?.meta?.sources) return;
	if (meta.meta.sources.some((s) => s.id === id)) return;
	meta.meta.sources.push({ id, name, url, fetchedAt: new Date().toISOString() });
}

/**
 * @param {typeof memoryCache.payload} meta
 * @param {string} section
 * @param {string} message
 */
function pushError(meta, section, message) {
	if (!meta) return;
	meta.meta.errors.push({ section, message });
}

async function fetchCurrencyDataUncached() {
	/** @type {typeof memoryCache.payload} */
	const result = {
		rates: {},
		crypto: {},
		gold: {},
		reference: { usdEcb: {} },
		updatedAt: new Date().toISOString(),
		meta: {
			sources: [],
			errors: [],
			tcmbBulletinDate: null,
			tcmbPreviousDate: null,
			methodology: {
				forex: 'TCMB resmi döviz alış/satış kurları (today.xml). Günlük değişim: önceki iş günü bülteni ile karşılaştırma.',
				crypto: 'Binance 24 saatlik işlem verisi (TRY çiftleri). Yedek: CoinGecko.',
				gold: 'Altın: Binance PAXG (1 ons altın tokeni) × USDT/TRY veya TCMB USD/TRY. Gram = ons fiyatı / 31,1035 g (uluslararası standart). Kuyumcu çeyrek/yarım fiyatı değildir.'
			}
		}
	};

	// —— 1) TCMB bugün ——
	let todayCurrencies = [];
	try {
		const tcmbRes = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', {
			headers: { 'User-Agent': 'MertNews/1.0 (news; +https://mertnews.example)' },
			signal: fetchTimeout(15_000)
		});
		if (!tcmbRes.ok) {
			pushError(result, 'forex', `TCMB today.xml HTTP ${tcmbRes.status}`);
		} else {
			const parsed = parseTcmbXml(await tcmbRes.text());
			todayCurrencies = parsed.currencies;
			result.meta.tcmbBulletinDate = parsed.bulletinDate;
			pushSource(result, 'tcmb-today', 'Türkiye Cumhuriyet Merkez Bankası', 'https://www.tcmb.gov.tr/kurlar/today.xml');

			const todayMap = indexTcmbByCode(todayCurrencies);
			const codes = sortForexCodes(Object.keys(todayMap));

			// Önceki iş günü bülteni (tatil için birkaç gün geriye)
			let prevMap = /** @type {Record<string, { buying: number, selling: number, unit: number }> | null} */ (null);
			if (parsed.bulletinDate && typeof parsed.bulletinDate === 'string') {
				let probe = previousBusinessUtcDay(parseTcmbBulletinDate(parsed.bulletinDate));
				for (let i = 0; i < 10 && !prevMap; i++) {
					const url = tcmbArchiveUrl(probe);
					try {
						const arch = await fetch(url, {
							headers: { 'User-Agent': 'MertNews/1.0 (news)' },
							signal: fetchTimeout(12_000)
						});
						if (arch.ok) {
							const ap = parseTcmbXml(await arch.text());
							prevMap = indexTcmbByCode(ap.currencies);
							result.meta.tcmbPreviousDate = `${String(probe.getUTCDate()).padStart(2, '0')}.${String(probe.getUTCMonth() + 1).padStart(2, '0')}.${probe.getUTCFullYear()}`;
							pushSource(result, 'tcmb-archive', 'TCMB arşiv (önceki gün)', url);
							break;
						}
					} catch {
						/* devam */
					}
					probe = previousBusinessUtcDay(probe);
				}
			}

			for (const code of codes) {
				const t = todayMap[code];
				if (!t) continue;
				const prev = prevMap?.[code];
				const change =
					prev && t.unit === prev.unit ? pctChange(t.selling, prev.selling) : null;
				result.rates[code] = {
					buying: t.buying,
					selling: t.selling,
					unit: t.unit,
					symbol: '₺',
					change,
					source: 'TCMB'
				};
			}
		}
	} catch (e) {
		console.error('TCMB today error:', e);
		pushError(result, 'forex', 'TCMB bağlantısı kurulamadı.');
	}

	// —— 2) Frankfurter / ECB (USD tabanlı referans, TRY değildir) ——
	const ff = await frankfurterUsdRates();
	if (ff?.rates && typeof ff.rates === 'object') {
		result.reference.usdEcb = { rates: ff.rates, date: ff.date ?? null };
		pushSource(result, 'frankfurter', 'ECB döviz kurları (Frankfurter API)', 'https://www.frankfurter.app');
	} else {
		pushError(result, 'reference', 'ECB referans kurları (Frankfurter) alınamadı.');
	}

	// —— 3) Binance TRY çiftleri + PAXG ——
	const usdtTryTicker = await binanceTicker24h('USDTTRY');
	let usdtTry = usdtTryTicker ? parseFloat(String(usdtTryTicker.lastPrice)) : NaN;
	if (!Number.isFinite(usdtTry) || usdtTry <= 0) {
		const usd = result.rates.USD;
		if (usd?.selling > 0) {
			usdtTry = usd.selling;
			pushSource(result, 'usdt-try-fallback', 'USDT/TRY: TCMB USD satış kuru', 'TCMB');
		}
	}

	let coingeckoData = null;

	const paxgUsdt = await binanceTicker24h('PAXGUSDT');
	if (paxgUsdt && Number.isFinite(usdtTry) && usdtTry > 0) {
		const xauUsd = parseFloat(String(paxgUsdt.lastPrice));
		const tryPerOz = xauUsd * usdtTry;
		const gramTry = tryPerOz / 31.1035;
		const chg = paxgUsdt.priceChangePercent != null ? String(paxgUsdt.priceChangePercent) : null;
		result.gold.GRAM_TRY = {
			price: gramTry.toFixed(2),
			symbol: '₺',
			change: chg,
			source: 'Binance PAXGUSDT × USDTTRY',
			note: 'spot_gram_paxg'
		};
		result.gold.XAU_USD_OZ = {
			price: xauUsd.toFixed(2),
			symbol: '$',
			change: chg,
			source: 'Binance PAXGUSDT',
			note: 'paxg_usd_per_oz'
		};
	} else {
		coingeckoData = await coingeckoBtcEth();
		const pg = coingeckoData?.['pax-gold'];
		if (pg?.try && pg?.usd) {
			const gramTry = parseFloat(String(pg.try)) / 31.1035;
			const chg = pg.usd_24h_change != null ? Number(pg.usd_24h_change).toFixed(2) : null;
			result.gold.GRAM_TRY = {
				price: gramTry.toFixed(2),
				symbol: '₺',
				change: chg,
				source: 'CoinGecko PAX Gold',
				note: 'spot_gram_paxg'
			};
			result.gold.XAU_USD_OZ = {
				price: Number(pg.usd).toFixed(2),
				symbol: '$',
				change: chg,
				source: 'CoinGecko PAX Gold',
				note: 'paxg_usd_per_oz'
			};
			pushSource(result, 'coingecko', 'CoinGecko', 'https://www.coingecko.com');
		} else {
			pushError(result, 'gold', 'Spot altın (PAXG) verisi alınamadı.');
		}
	}

	// Kripto: Binance TRY çiftleri (toplu), USD referansı paralel
	const tryPairs = [...new Set(BINANCE_TRY_SYMBOLS)];
	const tickerResults = await Promise.all(tryPairs.map((s) => binanceTicker24h(s)));

	let binanceUsed = false;
	const basesNeedingUsd = [];
	for (let i = 0; i < tryPairs.length; i++) {
		const t = tickerResults[i];
		if (!t?.lastPrice) continue;
		binanceUsed = true;
		const base = tryPairs[i].replace(/TRY$/, '');
		if (base !== 'USDT') basesNeedingUsd.push(base);
	}
	if (binanceUsed || paxgUsdt || usdtTryTicker) {
		pushSource(result, 'binance', 'Binance Spot API', 'https://www.binance.com/en/binance-api');
	}

	const usdTickerResults = await Promise.all(basesNeedingUsd.map((b) => binanceTicker24h(`${b}USDT`)));
	const usdByBase = Object.fromEntries(basesNeedingUsd.map((b, i) => [b, usdTickerResults[i]]));

	for (let i = 0; i < tryPairs.length; i++) {
		const sym = tryPairs[i];
		const t = tickerResults[i];
		if (!t?.lastPrice) continue;
		const base = sym.replace(/TRY$/, '');
		if (base === 'USDT') {
			result.crypto.USDT = {
				priceTRY: parseFloat(String(t.lastPrice)),
				priceUSD: 1,
				change: t.priceChangePercent != null ? String(t.priceChangePercent) : null,
				source: 'Binance',
				pair: sym
			};
			continue;
		}
		const usdT = usdByBase[base];
		const priceUsd = usdT?.lastPrice ? parseFloat(String(usdT.lastPrice)) : null;
		result.crypto[base] = {
			priceTRY: parseFloat(String(t.lastPrice)),
			priceUSD: priceUsd,
			change: t.priceChangePercent != null ? String(t.priceChangePercent) : null,
			source: 'Binance',
			pair: sym
		};
	}

	if (!result.crypto.BTC || !result.crypto.ETH) {
		if (!coingeckoData) coingeckoData = await coingeckoBtcEth();
		const cg = coingeckoData;
		if (cg?.bitcoin && !result.crypto.BTC) {
			result.crypto.BTC = {
				priceTRY: cg.bitcoin.try,
				priceUSD: cg.bitcoin.usd,
				change: cg.bitcoin.usd_24h_change != null ? Number(cg.bitcoin.usd_24h_change).toFixed(2) : null,
				source: 'CoinGecko',
				pair: 'aggregate'
			};
		}
		if (cg?.ethereum && !result.crypto.ETH) {
			result.crypto.ETH = {
				priceTRY: cg.ethereum.try,
				priceUSD: cg.ethereum.usd,
				change: cg.ethereum.usd_24h_change != null ? Number(cg.ethereum.usd_24h_change).toFixed(2) : null,
				source: 'CoinGecko',
				pair: 'aggregate'
			};
		}
		if (cg) pushSource(result, 'coingecko', 'CoinGecko', 'https://www.coingecko.com');
	}

	if (Object.keys(result.crypto).length === 0) {
		pushError(result, 'crypto', 'Kripto verisi alınamadı (Binance / CoinGecko).');
	}

	return result;
}

/**
 * Üretim: örnek veri yok. Kaynaklar meta içinde; hatalar errors dizisinde.
 */
export async function fetchCurrencyData() {
	const now = Date.now();
	if (memoryCache.payload && now - memoryCache.at < CACHE_MS) {
		return memoryCache.payload;
	}
	const payload = await fetchCurrencyDataUncached();
	memoryCache = { payload, at: now };
	return payload;
}
