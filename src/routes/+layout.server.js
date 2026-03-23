import { fetchCurrencyData } from '$lib/server/currency';
import { fetchWeatherData } from '$lib/server/weather';
import { getFeedNavColumns } from '$lib/server/rss';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies, request }) {
    let locale = cookies.get('locale');
    
    // If no manual preference, detect from browser/system headers
    if (!locale) {
        const acceptLang = request.headers.get('accept-language') || '';
        
        // Advanced parsing of Accept-Language header
        const languages = acceptLang.split(',').map(lang => {
            const [code, qVal] = lang.split(';q=');
            return {
                code: code.trim().split('-')[0].toLowerCase(),
                q: qVal ? parseFloat(qVal) : 1.0
            };
        }).sort((a, b) => b.q - a.q);

        const supported = languages.find(l => l.code === 'tr' || l.code === 'en');
        locale = supported ? supported.code : 'tr';
        
        cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    }

    const [currencyData, weatherData] = await Promise.all([
        fetchCurrencyData(),
        fetchWeatherData()
    ]);

    return {
        locale,
        currencyData,
        weatherData,
        feedNav: getFeedNavColumns()
    };
}
