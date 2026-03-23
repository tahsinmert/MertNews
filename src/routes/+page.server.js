import { redirect } from '@sveltejs/kit';
import { fetchNews, filterNewsBySourceSlugs } from '$lib/server/rss';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, url }) {
    const sourceSlugs = url.searchParams.getAll('kaynak');
    if (sourceSlugs.length === 1) {
        throw redirect(302, `/kaynak/${encodeURIComponent(sourceSlugs[0])}`);
    }
    const lang = cookies.get('locale') || 'tr';
    let news = await fetchNews(lang);
    news = filterNewsBySourceSlugs(news, sourceSlugs);
    return {
        news: news.slice(0, 72),
        activeSourceSlugs: sourceSlugs
    };
}
