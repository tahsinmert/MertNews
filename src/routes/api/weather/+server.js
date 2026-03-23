import { fetchWeatherData } from '$lib/server/weather';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
	setHeaders({
		'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
	});
	const data = await fetchWeatherData();
	return json(data);
}
