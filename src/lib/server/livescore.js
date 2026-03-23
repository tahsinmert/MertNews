/** @type {{ data: any, at: number }} */
let cache = { data: null, at: 0 };
const CACHE_MS = 60_000;

/** @param {number} ms */
function fetchTimeout(ms) {
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
		return AbortSignal.timeout(ms);
	}
	const c = new AbortController();
	setTimeout(() => c.abort(), ms);
	return c.signal;
}

/**
 * Fetches today's football matches from the free football-data.org API (no key needed for limited use).
 * Falls back to ESPN RSS for headlines.
 */
async function fetchLivescoreUncached() {
	const today = new Date().toISOString().split('T')[0];
	const competitions = [
		{ id: 'TR1', name: 'Süper Lig', flag: '🇹🇷' },
		{ id: 'CL', name: 'Şampiyonlar Ligi', flag: '🏆' },
		{ id: 'PL', name: 'Premier Lig', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
		{ id: 'PD', name: 'La Liga', flag: '🇪🇸' },
		{ id: 'SA', name: 'Serie A', flag: '🇮🇹' },
		{ id: 'BL1', name: 'Bundesliga', flag: '🇩🇪' }
	];

	const matches = [];

	for (const comp of competitions) {
		try {
			const res = await fetch(
				`https://api.football-data.org/v4/competitions/${comp.id}/matches?dateFrom=${today}&dateTo=${today}`,
				{
					headers: {
						Accept: 'application/json'
					},
					signal: fetchTimeout(8_000)
				}
			);

			if (!res.ok) continue;
			const data = await res.json();

			if (data?.matches?.length) {
				for (const m of data.matches) {
					matches.push({
						id: m.id,
						competition: comp.name,
						competitionFlag: comp.flag,
						status: m.status,
						minute: m.minute ?? null,
						homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? '?',
						homeCrest: m.homeTeam?.crest ?? null,
						awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? '?',
						awayCrest: m.awayTeam?.crest ?? null,
						homeScore: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
						awayScore: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
						utcDate: m.utcDate
					});
				}
			}
		} catch {
			continue;
		}
	}

	matches.sort((a, b) => {
		const statusOrder = { IN_PLAY: 0, PAUSED: 1, LIVE: 2, SCHEDULED: 3, TIMED: 4, FINISHED: 5 };
		const sa = statusOrder[a.status] ?? 6;
		const sb = statusOrder[b.status] ?? 6;
		if (sa !== sb) return sa - sb;
		return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
	});

	return {
		matches,
		fetchedAt: new Date().toISOString(),
		date: today
	};
}

export async function fetchLivescoreData() {
	const now = Date.now();
	if (cache.data && now - cache.at < CACHE_MS) {
		return cache.data;
	}
	const data = await fetchLivescoreUncached();
	if (data.matches.length > 0 || !cache.data) {
		cache = { data, at: now };
	}
	return cache.data ?? data;
}
