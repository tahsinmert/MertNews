import { fetchLivescoreData } from '$lib/server/livescore';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
	setHeaders({
		'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60'
	});
	const data = await fetchLivescoreData();
	return json(data);
}
