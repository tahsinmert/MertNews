import { fetchNews } from '$lib/server/rss';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    const lang = cookies.get('locale') || 'tr';
    
    if (!query) {
        return json([]);
    }

    const allNews = await fetchNews(lang);
    const filteredNews = allNews.filter(item => 
        item.title?.toLowerCase().includes(query) || 
        item.contentSnippet?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    ).slice(0, 10);

    return json(filteredNews);
}
