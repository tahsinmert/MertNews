/** @type {{ data: any, at: number }} */
let cache = { data: null, at: 0 };
const CACHE_MS = 10 * 60_000;

/** @param {number} ms */
function fetchTimeout(ms) {
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
		return AbortSignal.timeout(ms);
	}
	const c = new AbortController();
	setTimeout(() => c.abort(), ms);
	return c.signal;
}

const CITIES = [
	{ name: 'İstanbul', lat: 41.0082, lon: 28.9784 },
	{ name: 'Ankara', lat: 39.9334, lon: 32.8597 },
	{ name: 'İzmir', lat: 38.4237, lon: 27.1428 },
	{ name: 'Antalya', lat: 36.8969, lon: 30.7133 },
	{ name: 'Bursa', lat: 40.1885, lon: 29.0610 },
	{ name: 'Çanakkale', lat: 40.1553, lon: 26.4142 }
];

const WMO_ICONS = {
	0: { icon: '☀️', desc_tr: 'Açık', desc_en: 'Clear sky' },
	1: { icon: '🌤️', desc_tr: 'Az bulutlu', desc_en: 'Mainly clear' },
	2: { icon: '⛅', desc_tr: 'Parçalı bulutlu', desc_en: 'Partly cloudy' },
	3: { icon: '☁️', desc_tr: 'Bulutlu', desc_en: 'Overcast' },
	45: { icon: '🌫️', desc_tr: 'Sisli', desc_en: 'Fog' },
	48: { icon: '🌫️', desc_tr: 'Kırağılı sis', desc_en: 'Rime fog' },
	51: { icon: '🌦️', desc_tr: 'Hafif çisenti', desc_en: 'Light drizzle' },
	53: { icon: '🌦️', desc_tr: 'Çisenti', desc_en: 'Moderate drizzle' },
	55: { icon: '🌧️', desc_tr: 'Yoğun çisenti', desc_en: 'Dense drizzle' },
	61: { icon: '🌧️', desc_tr: 'Hafif yağmur', desc_en: 'Slight rain' },
	63: { icon: '🌧️', desc_tr: 'Yağmurlu', desc_en: 'Moderate rain' },
	65: { icon: '🌧️', desc_tr: 'Şiddetli yağmur', desc_en: 'Heavy rain' },
	71: { icon: '🌨️', desc_tr: 'Hafif kar', desc_en: 'Slight snow' },
	73: { icon: '🌨️', desc_tr: 'Kar yağışı', desc_en: 'Moderate snow' },
	75: { icon: '❄️', desc_tr: 'Yoğun kar', desc_en: 'Heavy snow' },
	77: { icon: '🌨️', desc_tr: 'Kar taneleri', desc_en: 'Snow grains' },
	80: { icon: '🌦️', desc_tr: 'Hafif sağanak', desc_en: 'Slight showers' },
	81: { icon: '🌧️', desc_tr: 'Sağanak yağış', desc_en: 'Moderate showers' },
	82: { icon: '⛈️', desc_tr: 'Şiddetli sağanak', desc_en: 'Violent showers' },
	85: { icon: '🌨️', desc_tr: 'Hafif kar sağanağı', desc_en: 'Slight snow showers' },
	86: { icon: '❄️', desc_tr: 'Yoğun kar sağanağı', desc_en: 'Heavy snow showers' },
	95: { icon: '⛈️', desc_tr: 'Gök gürültülü fırtına', desc_en: 'Thunderstorm' },
	96: { icon: '⛈️', desc_tr: 'Hafif dolu', desc_en: 'Thunderstorm with slight hail' },
	99: { icon: '⛈️', desc_tr: 'Dolu', desc_en: 'Thunderstorm with heavy hail' }
};

/**
 * @param {number} code
 * @param {string} lang
 */
function wmoInfo(code, lang) {
	const entry = WMO_ICONS[code] ?? WMO_ICONS[0];
	return {
		icon: entry.icon,
		description: lang === 'tr' ? entry.desc_tr : entry.desc_en
	};
}

async function fetchWeatherUncached() {
	const latitudes = CITIES.map((c) => c.lat).join(',');
	const longitudes = CITIES.map((c) => c.lon).join(',');

	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe/Istanbul&forecast_days=5`;

	try {
		const res = await fetch(url, {
			headers: { Accept: 'application/json' },
			signal: fetchTimeout(10_000)
		});
		if (!res.ok) return null;

		const raw = await res.json();
		const results = Array.isArray(raw) ? raw : [raw];

		return CITIES.map((city, i) => {
			const data = results[i];
			if (!data?.current) return null;

			const current = data.current;
			const daily = data.daily;

			return {
				city: city.name,
				lat: city.lat,
				lon: city.lon,
				current: {
					temp: Math.round(current.temperature_2m),
					feelsLike: Math.round(current.apparent_temperature),
					humidity: current.relative_humidity_2m,
					windSpeed: Math.round(current.wind_speed_10m),
					...wmoInfo(current.weather_code, 'tr')
				},
				forecast: daily?.time?.map((/** @type {string} */ date, /** @type {number} */ j) => ({
					date,
					maxTemp: Math.round(daily.temperature_2m_max[j]),
					minTemp: Math.round(daily.temperature_2m_min[j]),
					...wmoInfo(daily.weather_code[j], 'tr')
				})) ?? []
			};
		}).filter(Boolean);
	} catch (e) {
		console.error('Weather fetch error:', e);
		return null;
	}
}

export async function fetchWeatherData() {
	const now = Date.now();
	if (cache.data && now - cache.at < CACHE_MS) {
		return cache.data;
	}
	const data = await fetchWeatherUncached();
	if (data) {
		cache = { data, at: now };
	}
	return cache.data ?? data;
}
