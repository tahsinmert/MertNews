import Parser from 'rss-parser';
import { translateText } from './translate';

/**
 * Haber kaynakları: uluslararası ve Türkiye’de yaygın kabul gören, doğrudan resmi RSS
 * uçlarından beslenen kuruluşlar (kamu yayınları, büyük ajanslar, ana akım gazeteler).
 * RSS içeriği her zaman kaynağın kendi başlık/özet metnidir; doğruluk için özgün makaleye yönlendirir.
 */
const FEEDS = [
	// — Dünya (İngilizce / uluslararası) —
	{ name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'Dunya', lang: 'en' },
	{ name: 'CNN International', url: 'http://rss.cnn.com/rss/edition.rss', category: 'Dunya', lang: 'en' },
	{ name: 'The Guardian (World)', url: 'https://www.theguardian.com/world/rss', category: 'Dunya', lang: 'en' },
	{ name: 'TRT World', url: 'https://www.trtworld.com/feed/news/world', category: 'Dunya', lang: 'en' },
	{ name: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'Dunya', lang: 'en' },
	{ name: 'Deutsche Welle (World)', url: 'https://rss.dw.com/rdf/rss-en-world', category: 'Dunya', lang: 'en' },
	{ name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'Dunya', lang: 'en' },
	{ name: 'France 24', url: 'https://www.france24.com/en/rss', category: 'Dunya', lang: 'en' },
	{ name: 'Euronews', url: 'https://www.euronews.com/rss?format=rss&lang=en', category: 'Dunya', lang: 'en' },
	{ name: 'Sky News (World)', url: 'https://feeds.skynews.com/feeds/rss/world.xml', category: 'Dunya', lang: 'en' },
	{ name: 'The Independent (World)', url: 'https://www.independent.co.uk/news/world/rss', category: 'Dunya', lang: 'en' },
	{ name: 'Anadolu Agency (EN)', url: 'https://www.aa.com.tr/en/rss/default?cat=guncel', category: 'Dunya', lang: 'en' },

	// — Türkiye —
	{ name: 'Hürriyet', url: 'https://www.hurriyet.com.tr/rss/anasayfa', category: 'Turkiye', lang: 'tr' },
	{ name: 'Anadolu Ajansı', url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', category: 'Turkiye', lang: 'tr' },
	{ name: 'TRT Haber', url: 'https://www.trthaber.com/sondakika_articles.rss', category: 'Turkiye', lang: 'tr' },
	{ name: 'Sabah', url: 'https://www.sabah.com.tr/rss/gundem.xml', category: 'Turkiye', lang: 'tr' },
	{ name: 'Milliyet', url: 'https://www.milliyet.com.tr/rss/rssNew/gundemRss.xml', category: 'Turkiye', lang: 'tr' },
	{ name: 'CNN Türk', url: 'https://www.cnnturk.com/feed/rss/all/news', category: 'Turkiye', lang: 'tr' },
	{ name: 'NTV', url: 'https://www.ntv.com.tr/gundem.rss', category: 'Turkiye', lang: 'tr' },

	// — Teknoloji —
	{ name: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'Teknoloji', lang: 'en' },
	{ name: 'The Guardian (Tech)', url: 'https://www.theguardian.com/technology/rss', category: 'Teknoloji', lang: 'en' },
	{ name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Teknoloji', lang: 'en' },
	{ name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Teknoloji', lang: 'en' },
	{ name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Teknoloji', lang: 'en' },
	{ name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Teknoloji', lang: 'en' },
	{ name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Teknoloji', lang: 'en' },

	// — Ekonomi & iş dünyası —
	{ name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'Ekonomi', lang: 'en' },
	{ name: 'The Guardian (Business)', url: 'https://www.theguardian.com/business/rss', category: 'Ekonomi', lang: 'en' },
	{ name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'Ekonomi', lang: 'en' },
	{ name: 'Hürriyet Ekonomi', url: 'https://www.hurriyet.com.tr/rss/ekonomi', category: 'Ekonomi', lang: 'tr' },
	{ name: 'Bloomberg HT', url: 'https://www.bloomberght.com/rss', category: 'Ekonomi', lang: 'tr' }
];

/**
 * @param {string} name
 */
function slugifySourceName(name) {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[()]/g, ' ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** @param {typeof FEEDS} feeds */
function buildNameToSlugMap(feeds) {
	/** @type {Map<string, string>} */
	const map = new Map();
	const taken = new Set();
	for (const f of feeds) {
		let base = slugifySourceName(f.name);
		let slug = base;
		let i = 0;
		while (taken.has(slug)) {
			i += 1;
			slug = `${base}-${i}`;
		}
		taken.add(slug);
		map.set(f.name, slug);
	}
	return map;
}

const SOURCE_NAME_TO_SLUG = buildNameToSlugMap(FEEDS);
const SOURCE_SLUG_TO_NAME = new Map(
	[...SOURCE_NAME_TO_SLUG.entries()].map(([name, slug]) => [slug, name])
);

/** @param {string[]} slugs */
export function resolveSourceSlugs(slugs) {
	if (!Array.isArray(slugs) || !slugs.length) return [];
	const names = [];
	for (const s of slugs) {
		const n = SOURCE_SLUG_TO_NAME.get(s);
		if (n) names.push(n);
	}
	return names;
}

const CATEGORY_TO_PATH = {
	Dunya: '/dunya',
	Turkiye: '/turkiye',
	Teknoloji: '/teknoloji',
	Ekonomi: '/ekonomi'
};

/** Kategori sayfaları + spor için navigasyon / mega menü verisi */
export function getFeedNavColumns() {
	const baseCols = [
		{ internal: 'Dunya', path: '/dunya', labelKey: 'nav.world' },
		{ internal: 'Turkiye', path: '/turkiye', labelKey: 'nav.turkey' },
		{ internal: 'Teknoloji', path: '/teknoloji', labelKey: 'nav.technology' },
		{ internal: 'Ekonomi', path: '/ekonomi', labelKey: 'nav.economy' }
	].map((col) => ({
		...col,
		sources: FEEDS.filter((f) => f.category === col.internal).map((f) => ({
			name: f.name,
			slug: SOURCE_NAME_TO_SLUG.get(f.name)
		}))
	}));

	return [
		...baseCols,
		{ internal: 'Spor', path: '/spor', labelKey: 'nav.sports', sources: [] }
	];
}

/** @param {string} internalCategory */
export function getSourcesForCategory(internalCategory) {
	return FEEDS.filter((f) => f.category === internalCategory).map((f) => ({
		name: f.name,
		slug: SOURCE_NAME_TO_SLUG.get(f.name)
	}));
}

const MAX_ITEMS_SINGLE_SOURCE = 48;

/**
 * @param {string} slug
 * @returns {{ slug: string; name: string; category: string; categoryPath: string; lang: string; rssUrl: string } | null}
 */
export function getFeedBySlug(slug) {
	const name = SOURCE_SLUG_TO_NAME.get(slug);
	if (!name) return null;
	const feed = FEEDS.find((f) => f.name === name);
	if (!feed) return null;
	const categoryPath = CATEGORY_TO_PATH[feed.category] || '/';
	return {
		slug,
		name: feed.name,
		category: feed.category,
		categoryPath,
		lang: feed.lang,
		rssUrl: feed.url
	};
}

/** Tüm kaynaklar — dizin sayfası ve harita için */
export function getAllSourcesCatalog() {
	return FEEDS.map((f) => ({
		slug: SOURCE_NAME_TO_SLUG.get(f.name),
		name: f.name,
		category: f.category,
		categoryPath: CATEGORY_TO_PATH[f.category] || '/',
		lang: f.lang
	}))
		.filter((row) => Boolean(row.slug))
		.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

/**
 * Tek kaynak sayfası için yalnızca o RSS akışı.
 * @param {string} slug
 * @param {string} targetLang
 */
export async function fetchNewsForSourceSlug(slug, targetLang = 'tr') {
	const meta = getFeedBySlug(slug);
	if (!meta) return [];
	const feed = FEEDS.find((f) => f.name === meta.name);
	if (!feed) return [];
	try {
		const response = await parser.parseURL(feed.url);
		let items = (response.items || [])
			.slice(0, MAX_ITEMS_SINGLE_SOURCE)
			.map((item) => normalizeItem(item, feed, targetLang))
			.filter(Boolean);

		await demoteBrokenFeedImages(items);

		const needsTranslation = items
			.filter((item) => item.nativeLang !== targetLang)
			.slice(0, TRANSLATE_TITLE_CAP);
		const otherNews = items.filter(
			(item) => item.nativeLang === targetLang || !needsTranslation.includes(item)
		);
		const translatedNews = await translateTitlesInBatches(needsTranslation, targetLang);
		const merged = [...translatedNews, ...otherNews];
		sortNewsWithImagesFirst(merged);
		return merged;
	} catch (err) {
		console.error(`RSS single feed failed [${feed.name}]:`, err?.message || err);
		return [];
	}
}

/**
 * @param {Array<{ source?: string }>} news
 * @param {string[]} slugs
 */
export function filterNewsBySourceSlugs(news, slugs) {
	const names = resolveSourceSlugs(slugs);
	if (!names.length) return news;
	return news.filter((item) => names.includes(item.source));
}

const MAX_ITEMS_PER_FEED = 22;
const TRANSLATE_TITLE_CAP = 56;
const TRANSLATE_CONCURRENCY = 8;
/** En çok bu kadar benzersiz görsel URL’si için sunucuda erişilebilirlik kontrolü (süre/limit). */
const MAX_IMAGE_URLS_TO_VERIFY = 80;
const IMAGE_VERIFY_CONCURRENCY = 10;
const IMAGE_VERIFY_MS = 2200;

const DEFAULT_NEWS_IMAGE =
	'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

const parser = new Parser({
	timeout: 22000,
	headers: {
		'User-Agent':
			'Mozilla/5.0 (compatible; MertNews/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		Accept: 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8'
	},
	customFields: {
		item: [
			['media:content', 'media', { keepArray: true }],
			['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
			['content:encoded', 'contentEncoded'],
			['description', 'description'],
			['enclosure', 'enclosure']
		]
	}
});

/**
 * @param {string} raw
 * @param {string | undefined} baseUrl
 */
function absolutizeImageUrl(raw, baseUrl) {
	if (!raw || typeof raw !== 'string') return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	if (!baseUrl) return null;
	try {
		return new URL(trimmed, baseUrl).href;
	} catch {
		return null;
	}
}

/**
 * @param {import('rss-parser').Item & Record<string, unknown>} item
 */
function extractImage(item) {
	const base = typeof item.link === 'string' ? item.link : undefined;

	const mediaList = Array.isArray(item.media) ? item.media : item.media ? [item.media] : [];
	for (const m of mediaList) {
		const url = m?.$?.url;
		const type = m?.$?.type ? String(m.$.type) : '';
		if (url && (!type || type.startsWith('image/'))) {
			const abs = absolutizeImageUrl(url, base);
			if (abs) return abs;
		}
	}

	const thumbs = item.mediaThumbnail;
	const thumbArr = Array.isArray(thumbs) ? thumbs : thumbs ? [thumbs] : [];
	for (const t of thumbArr) {
		const u = t?.$?.url;
		if (u) {
			const abs = absolutizeImageUrl(u, base);
			if (abs) return abs;
		}
	}

	if (item.enclosure?.url) {
		const encType = String(item.enclosure.type || '');
		if (encType.startsWith('image/')) {
			const abs = absolutizeImageUrl(item.enclosure.url, base);
			if (abs) return abs;
		}
	}

	const html =
		(typeof item.contentEncoded === 'string' && item.contentEncoded) ||
		(typeof item.content === 'string' && item.content) ||
		(typeof item.description === 'string' && item.description) ||
		'';

	const patterns = [
		/<img[^>]+src=["']([^"'>\s]+)["']/i,
		/\ssrc=["']([^"'>\s]+)["']/i,
		/data-src=["']([^"'>\s]+)["']/i,
		/<media:content[^>]+url=["']([^"'>\s]+)["']/i
	];
	for (const re of patterns) {
		const match = html.match(re);
		const candidate = match?.[1];
		if (candidate && !/\/spacer\.|\/pixel\.|1x1|blank\.gif|transparent|\/clear\.gif/i.test(candidate)) {
			const abs = absolutizeImageUrl(candidate, base);
			if (
				abs &&
				(/\.(jpe?g|png|gif|webp|avif|bmp)(\?|#|$)/i.test(abs) ||
					/\/(image|images|media|photos?|img)\//i.test(abs))
			) {
				return abs;
			}
		}
	}

	return DEFAULT_NEWS_IMAGE;
}

/**
 * @param {string} url
 */
async function probeImageUrl(url) {
	const headers = {
		'User-Agent':
			'Mozilla/5.0 (compatible; MertNews/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		Accept: 'image/avif,image/webp,image/*,*/*;q=0.8'
	};
	const signal = AbortSignal.timeout(IMAGE_VERIFY_MS);
	try {
		const res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers, signal });
		if (res.ok) {
			const ct = (res.headers.get('content-type') || '').toLowerCase();
			if (ct.includes('image/') || !ct) return true;
		}
		if (res.status === 405 || res.status === 501) {
			const r2 = await fetch(url, {
				method: 'GET',
				redirect: 'follow',
				headers: { ...headers, Range: 'bytes=0-2047' },
				signal: AbortSignal.timeout(IMAGE_VERIFY_MS)
			});
			if (!r2.ok) return false;
			const ct = (r2.headers.get('content-type') || '').toLowerCase();
			return ct.includes('image/') || ct.includes('octet-stream');
		}
		return false;
	} catch {
		try {
			const r2 = await fetch(url, {
				method: 'GET',
				redirect: 'follow',
				headers: { ...headers, Range: 'bytes=0-2047' },
				signal: AbortSignal.timeout(IMAGE_VERIFY_MS)
			});
			if (!r2.ok) return false;
			const ct = (r2.headers.get('content-type') || '').toLowerCase();
			return ct.includes('image/') || ct.includes('octet-stream');
		} catch {
			return false;
		}
	}
}

/**
 * @param {string[]} urls
 * @returns {Promise<Map<string, boolean>>}
 */
async function verifyImageUrls(urls) {
	/** @type {Map<string, boolean>} */
	const out = new Map();
	for (let i = 0; i < urls.length; i += IMAGE_VERIFY_CONCURRENCY) {
		const chunk = urls.slice(i, i + IMAGE_VERIFY_CONCURRENCY);
		const pairs = await Promise.all(
			chunk.map(async (u) => {
				const ok = await probeImageUrl(u);
				return [u, ok];
			})
		);
		for (const [u, ok] of pairs) out.set(u, ok);
	}
	return out;
}

/**
 * Önce tarihe göre sıralı listeden, öne çıkan haberlerin görsellerini doğrula; kırık URL’leri varsayılan görsele çevir.
 * @param {ReturnType<typeof normalizeItem>[]} items
 */
async function demoteBrokenFeedImages(items) {
	const seen = new Set();
	const toVerify = [];
	for (const item of items) {
		if (!item || item.image === DEFAULT_NEWS_IMAGE) continue;
		if (seen.has(item.image)) continue;
		seen.add(item.image);
		toVerify.push(item.image);
		if (toVerify.length >= MAX_IMAGE_URLS_TO_VERIFY) break;
	}
	if (toVerify.length === 0) return;
	const verified = await verifyImageUrls(toVerify);
	for (const item of items) {
		if (!item || item.image === DEFAULT_NEWS_IMAGE) continue;
		if (!verified.has(item.image)) continue;
		if (verified.get(item.image) === false) {
			item.image = DEFAULT_NEWS_IMAGE;
		}
	}
}

/**
 * Gerçek (varsayılan olmayan) ve erişilebilir görselli haberleri öne al; sonra yayın tarihi.
 * @param {ReturnType<typeof normalizeItem>[]} items
 */
function sortNewsWithImagesFirst(items) {
	items.sort((a, b) => {
		if (!a || !b) return 0;
		const aPlaceholder = a.image === DEFAULT_NEWS_IMAGE;
		const bPlaceholder = b.image === DEFAULT_NEWS_IMAGE;
		if (aPlaceholder !== bPlaceholder) return aPlaceholder ? 1 : -1;
		return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
	});
}

/**
 * @param {import('rss-parser').Item} item
 */
function parseItemDate(item) {
	const raw = item.pubDate || item.isoDate;
	if (!raw) return new Date();
	const d = new Date(raw);
	return Number.isNaN(d.getTime()) ? new Date() : d;
}

/**
 * @param {import('rss-parser').Item & Record<string, unknown>} item
 * @param {{ name: string; category: string; lang: string }} feed
 * @param {string} targetLang
 */
function normalizeItem(item, feed, targetLang) {
	if (!item.title || !item.link) return null;
	const date = parseItemDate(item);
	return {
		...item,
		pubDate: date.toUTCString(),
		source: feed.name,
		category: feed.category,
		image: extractImage(item),
		nativeLang: feed.lang,
		formattedDate: date.toLocaleDateString(targetLang === 'tr' ? 'tr-TR' : 'en-US', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	};
}

/**
 * @param {Awaited<ReturnType<typeof normalizeItem>>[]} items
 * @param {string} targetLang
 */
async function translateTitlesInBatches(items, targetLang) {
	const out = [];
	for (let i = 0; i < items.length; i += TRANSLATE_CONCURRENCY) {
		const chunk = items.slice(i, i + TRANSLATE_CONCURRENCY);
		const done = await Promise.all(
			chunk.map(async (item) => {
				if (!item) return item;
				try {
					const translatedTitle = await translateText(item.title, targetLang);
					return { ...item, title: translatedTitle };
				} catch {
					return item;
				}
			})
		);
		out.push(...done);
	}
	return out;
}

export async function fetchNews(targetLang = 'tr') {
	try {
		const feedPromises = FEEDS.map(async (feed) => {
			try {
				const response = await parser.parseURL(feed.url);
				const items = (response.items || [])
					.slice(0, MAX_ITEMS_PER_FEED)
					.map((item) => normalizeItem(item, feed, targetLang))
					.filter(Boolean);

				return items;
			} catch (err) {
				console.error(`RSS fetch failed [${feed.name}]:`, err?.message || err);
				return [];
			}
		});

		const results = await Promise.all(feedPromises);
		let allNews = results.flat();

		const seen = new Set();
		allNews = allNews.filter((item) => {
			const key = item.link || item.guid;
			if (!key || seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

		await demoteBrokenFeedImages(allNews);

		const needsTranslation = allNews
			.filter((item) => item.nativeLang !== targetLang)
			.slice(0, TRANSLATE_TITLE_CAP);

		const otherNews = allNews.filter(
			(item) => item.nativeLang === targetLang || !needsTranslation.includes(item)
		);

		const translatedNews = await translateTitlesInBatches(needsTranslation, targetLang);

		const merged = [...translatedNews, ...otherNews];
		sortNewsWithImagesFirst(merged);
		return merged;
	} catch (error) {
		console.error('Error fetching news:', error);
		return [];
	}
}
