import { redirect } from '@sveltejs/kit';
import { fetchNews, filterNewsBySourceSlugs } from '$lib/server/rss';
import { fetchLivescoreData } from '$lib/server/livescore';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, url }) {
	const sourceSlugs = url.searchParams.getAll('kaynak');
	if (sourceSlugs.length === 1) {
		throw redirect(302, `/kaynak/${encodeURIComponent(sourceSlugs[0])}`);
	}
	const lang = cookies.get('locale') || 'tr';

	const [allNewsRaw, livescoreData] = await Promise.all([
		fetchNews(lang),
		fetchLivescoreData()
	]);

	const allNews = filterNewsBySourceSlugs(allNewsRaw, sourceSlugs);

	return {
		news: allNews.slice(0, 72),
		activeSourceSlugs: sourceSlugs,
		livescoreData
	};
}

