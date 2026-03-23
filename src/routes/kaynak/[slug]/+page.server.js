import { error } from '@sveltejs/kit';
import {
	fetchNewsForSourceSlug,
	getFeedBySlug,
	getSourcesForCategory
} from '$lib/server/rss';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, cookies }) {
	const meta = getFeedBySlug(params.slug);
	if (!meta) throw error(404, 'Not found');
	const lang = cookies.get('locale') || 'tr';
	const news = await fetchNewsForSourceSlug(params.slug, lang);
	const siblings = getSourcesForCategory(meta.category).filter((s) => s.slug !== meta.slug);
	return {
		meta,
		news: news.slice(0, 48),
		siblingSources: siblings
	};
}
