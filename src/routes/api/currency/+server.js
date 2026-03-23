import { fetchCurrencyData } from '$lib/server/currency';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
	setHeaders({
		'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60'
	});
	const data = await fetchCurrencyData();
	return json(data);
}
