/** TCMB + arayüzde gösterim sırası (önce majör, sonra alfabetik) */
export const FOREX_DISPLAY_ORDER = [
	'USD',
	'EUR',
	'GBP',
	'CHF',
	'JPY',
	'AUD',
	'CAD',
	'DKK',
	'SEK',
	'NOK',
	'SAR',
	'KWD',
	'BGN',
	'RON',
	'RUB',
	'CNY',
	'KRW',
	'PKR',
	'IRR',
	'AZN',
	'GEL',
	'AED',
	'KZT',
	'QAR'
];

/**
 * @param {string[]} codes
 * @returns {string[]}
 */
export function sortForexCodes(codes) {
	return [...new Set(codes)].sort((a, b) => {
		const ia = FOREX_DISPLAY_ORDER.indexOf(a);
		const ib = FOREX_DISPLAY_ORDER.indexOf(b);
		if (ia !== -1 && ib !== -1) return ia - ib;
		if (ia !== -1) return -1;
		if (ib !== -1) return 1;
		return a.localeCompare(b);
	});
}

const CRYPTO_ORDER = ['BTC', 'ETH', 'USDT', 'XRP', 'SOL', 'ADA', 'AVAX', 'DOT', 'LINK', 'LTC', 'NEO', 'MATIC', 'ATOM'];

/**
 * @param {string[]} codes
 * @returns {string[]}
 */
export function sortCryptoCodes(codes) {
	return [...new Set(codes)].sort((a, b) => {
		const ia = CRYPTO_ORDER.indexOf(a);
		const ib = CRYPTO_ORDER.indexOf(b);
		if (ia !== -1 && ib !== -1) return ia - ib;
		if (ia !== -1) return -1;
		if (ib !== -1) return 1;
		return a.localeCompare(b);
	});
}
