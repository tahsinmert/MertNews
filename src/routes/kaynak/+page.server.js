import { getAllSourcesCatalog } from '$lib/server/rss';

const CATEGORY_ORDER = ['Dunya', 'Turkiye', 'Teknoloji', 'Ekonomi'];

/** @type {import('./$types').PageServerLoad} */
export function load() {
	const sources = getAllSourcesCatalog();
	const byCategory = new Map();
	for (const s of sources) {
		if (!byCategory.has(s.category)) byCategory.set(s.category, []);
		byCategory.get(s.category).push(s);
	}
	const groups = [...byCategory.entries()].map(([category, items]) => ({
		category,
		items: items.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
	}));
	groups.sort(
		(a, b) =>
			(CATEGORY_ORDER.indexOf(a.category) === -1 ? 99 : CATEGORY_ORDER.indexOf(a.category)) -
			(CATEGORY_ORDER.indexOf(b.category) === -1 ? 99 : CATEGORY_ORDER.indexOf(b.category))
	);
	return { groups };
}
