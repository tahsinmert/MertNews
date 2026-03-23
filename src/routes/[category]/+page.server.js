import { redirect } from '@sveltejs/kit';
import { fetchNews, filterNewsBySourceSlugs, getSourcesForCategory } from '$lib/server/rss';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, cookies, url }) {
    const { category } = params;
    const sourceSlugs = url.searchParams.getAll('kaynak');
    if (sourceSlugs.length === 1) {
        throw redirect(302, `/kaynak/${encodeURIComponent(sourceSlugs[0])}`);
    }
    const lang = cookies.get('locale') || 'tr';

    // Map URL slug to internal category name
    const categoryMap = {
        dunya: 'Dunya',
        turkiye: 'Turkiye',
        teknoloji: 'Teknoloji',
        ekonomi: 'Ekonomi'
    };

    const internalCategory = categoryMap[category] || 'Dunya';
    const allNews = await fetchNews(lang);

    let filteredNews = allNews.filter((item) => item.category === internalCategory);
    filteredNews = filterNewsBySourceSlugs(filteredNews, sourceSlugs);

    return {
        categoryName: internalCategory,
        news: filteredNews.slice(0, 72),
        sourceOptions: getSourcesForCategory(internalCategory),
        activeSourceSlugs: sourceSlugs
    };
}
