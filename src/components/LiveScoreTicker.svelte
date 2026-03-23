<script>
	import { locale } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let data = null;

	let scoreData = data;
	let selectedMatch = -1;

	async function refreshScores() {
		try {
			const res = await fetch('/api/livescore');
			const newData = await res.json();
			if (newData?.matches) scoreData = newData;
		} catch (e) {
			console.error('Livescore refresh error:', e);
		}
	}

	onMount(() => {
		if (!scoreData) refreshScores();
		const interval = setInterval(refreshScores, 60_000);
		return () => clearInterval(interval);
	});

	$: matches = scoreData?.matches ?? [];
	$: hasLive = matches.some((m) => ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status));

	const STATUS_MAP = {
		IN_PLAY: { tr: 'Canlı', en: 'Live', color: 'live' },
		PAUSED: { tr: 'Devre Arası', en: 'Half-time', color: 'paused' },
		LIVE: { tr: 'Canlı', en: 'Live', color: 'live' },
		FINISHED: { tr: 'Bitti', en: 'FT', color: 'finished' },
		SCHEDULED: { tr: 'Planlandı', en: 'Scheduled', color: 'scheduled' },
		TIMED: { tr: 'Planlandı', en: 'Timed', color: 'scheduled' },
		POSTPONED: { tr: 'Ertelendi', en: 'Postponed', color: 'postponed' },
		CANCELLED: { tr: 'İptal', en: 'Cancelled', color: 'postponed' }
	};

	function getStatus(status) {
		const s = STATUS_MAP[status] ?? STATUS_MAP.SCHEDULED;
		return { label: $locale === 'tr' ? s.tr : s.en, color: s.color };
	}

	function formatTime(utcDate) {
		try {
			const d = new Date(utcDate);
			return d.toLocaleTimeString($locale === 'tr' ? 'tr-TR' : 'en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				timeZone: 'Europe/Istanbul'
			});
		} catch {
			return '';
		}
	}

	function isLive(status) {
		return ['IN_PLAY', 'PAUSED', 'LIVE'].includes(status);
	}
</script>

{#if matches.length > 0}
	<section class="livescore-section" aria-label={$locale === 'tr' ? 'Canlı Skorlar' : 'Live Scores'}>
		<div class="score-header">
			<div class="score-header-left">
				<h2 class="score-title">{$locale === 'tr' ? 'Canlı Skorlar' : 'Live Scores'}</h2>
				{#if hasLive}
					<div class="live-badge">
						<span class="live-pulse"></span>
						<span>LIVE</span>
					</div>
				{/if}
			</div>
			<span class="match-count">{matches.length} {$locale === 'tr' ? 'maç' : 'matches'}</span>
		</div>

		<div class="matches-scroll">
			{#each matches as match, i (match.id)}
				<button
					class="match-card"
					class:is-live={isLive(match.status)}
					class:is-selected={selectedMatch === i}
					on:click={() => selectedMatch = selectedMatch === i ? -1 : i}
					in:fade={{ duration: 200, delay: i * 40 }}
				>
					<div class="match-comp">
						<span class="comp-flag">{match.competitionFlag}</span>
						<span class="comp-name">{match.competition}</span>
					</div>

					<div class="match-body">
						<div class="team home">
							{#if match.homeCrest}
								<img
									src={match.homeCrest}
									alt=""
									class="team-crest"
									loading="lazy"
									on:error={(e) => { e.target.style.display = 'none'; }}
								/>
							{/if}
							<span class="team-name">{match.homeTeam}</span>
						</div>

						<div class="score-center">
							{#if match.homeScore != null && match.awayScore != null}
								<div class="score-nums" class:is-live={isLive(match.status)}>
									<span class="score-num">{match.homeScore}</span>
									<span class="score-dash">–</span>
									<span class="score-num">{match.awayScore}</span>
								</div>
							{:else}
								<span class="match-time">{formatTime(match.utcDate)}</span>
							{/if}

							<div class="status-badge {getStatus(match.status).color}">
								{#if isLive(match.status)}
									<span class="status-dot"></span>
								{/if}
								{getStatus(match.status).label}
								{#if match.minute}
									<span class="minute">{match.minute}'</span>
								{/if}
							</div>
						</div>

						<div class="team away">
							<span class="team-name">{match.awayTeam}</span>
							{#if match.awayCrest}
								<img
									src={match.awayCrest}
									alt=""
									class="team-crest"
									loading="lazy"
									on:error={(e) => { e.target.style.display = 'none'; }}
								/>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>

		{#if scoreData?.fetchedAt}
			<p class="updated-at">
				{$locale === 'tr' ? 'Güncellendi' : 'Updated'}: {new Date(scoreData.fetchedAt).toLocaleTimeString(
					$locale === 'tr' ? 'tr-TR' : 'en-GB',
					{ hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' }
				)}
			</p>
		{/if}
	</section>
{/if}

<style>
	.livescore-section {
		padding: 0 0 2rem;
	}

	.score-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.score-header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.score-title {
		font-family: var(--font-main);
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		line-height: 1.05;
		color: var(--fg);
		margin: 0;
	}

	.live-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		border-radius: 980px;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--apple-red);
		background: rgba(255, 59, 48, 0.1);
	}

	.live-pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--apple-red);
		animation: pulse-red 1.5s ease-in-out infinite;
	}

	@keyframes pulse-red {
		0%, 100% { opacity: 0.5; transform: scale(0.9); }
		50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 8px var(--apple-red); }
	}

	.match-count {
		font-size: 0.8125rem;
		color: var(--apple-eyebrow);
		font-weight: 500;
	}

	.matches-scroll {
		display: flex;
		gap: 12px;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		scroll-snap-type: x proximity;
		padding-bottom: 8px;
	}

	.matches-scroll::-webkit-scrollbar { display: none; }

	.match-card {
		flex: 0 0 min(85vw, 320px);
		scroll-snap-align: start;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: 16px;
		padding: 14px 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: var(--apple-tile-shadow);
		transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.3s;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-text);
		color: var(--fg);
	}

	.match-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--apple-tile-shadow-hover);
	}

	.match-card.is-live {
		border-color: rgba(255, 59, 48, 0.2);
		box-shadow: var(--apple-tile-shadow), 0 0 0 1px rgba(255, 59, 48, 0.08);
	}

	.match-comp {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.6875rem;
		color: var(--apple-eyebrow);
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.comp-flag {
		font-size: 0.875rem;
		line-height: 1;
	}

	.match-body {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.team {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.team.away {
		justify-content: flex-end;
		text-align: right;
	}

	.team-crest {
		width: 24px;
		height: 24px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.team-name {
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.score-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
		min-width: 60px;
	}

	.score-nums {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.score-num {
		font-size: 1.375rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}

	.score-nums.is-live .score-num {
		color: var(--apple-red);
	}

	.score-dash {
		font-size: 1rem;
		color: var(--apple-eyebrow);
		font-weight: 400;
	}

	.match-time {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--fg);
		font-variant-numeric: tabular-nums;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 2px 8px;
		border-radius: 980px;
	}

	.status-badge.live {
		color: var(--apple-red);
		background: rgba(255, 59, 48, 0.1);
	}

	.status-badge.paused {
		color: var(--apple-orange);
		background: rgba(255, 149, 0, 0.1);
	}

	.status-badge.finished {
		color: var(--apple-eyebrow);
		background: rgba(0, 0, 0, 0.04);
	}

	:global([prefers-color-scheme='dark']) .status-badge.finished {
		background: rgba(255, 255, 255, 0.06);
	}

	.status-badge.scheduled {
		color: var(--apple-blue);
		background: rgba(0, 102, 204, 0.08);
	}

	.status-badge.postponed {
		color: var(--apple-eyebrow);
		background: rgba(0, 0, 0, 0.04);
	}

	.status-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
		animation: pulse-red 1.5s ease-in-out infinite;
	}

	.minute {
		font-variant-numeric: tabular-nums;
	}

	.updated-at {
		text-align: right;
		font-size: 0.6875rem;
		color: var(--apple-eyebrow);
		margin-top: 0.75rem;
		margin-bottom: 0;
	}

	@media (max-width: 734px) {
		.match-card {
			flex: 0 0 min(82vw, 280px);
			padding: 12px 14px;
		}

		.score-title {
			font-size: clamp(1.5rem, 5vw, 2rem);
		}
	}
</style>
