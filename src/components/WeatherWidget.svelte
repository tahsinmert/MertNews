<script>
	import { t, locale } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let data = null;

	let weatherData = data;
	let selectedCity = 0;
	let showForecast = false;

	async function refreshWeather() {
		try {
			const res = await fetch('/api/weather');
			const newData = await res.json();
			if (newData?.length) weatherData = newData;
		} catch (e) {
			console.error('Weather refresh error:', e);
		}
	}

	onMount(() => {
		if (!weatherData) refreshWeather();
		const interval = setInterval(refreshWeather, 10 * 60_000);
		return () => clearInterval(interval);
	});

	$: city = weatherData?.[selectedCity] ?? null;

	/** @param {string} dateStr */
	function formatDay(dateStr) {
		const date = new Date(dateStr + 'T12:00:00');
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (dateStr === today.toISOString().split('T')[0]) {
			return $locale === 'tr' ? 'Bugün' : 'Today';
		}
		if (dateStr === tomorrow.toISOString().split('T')[0]) {
			return $locale === 'tr' ? 'Yarın' : 'Tomorrow';
		}

		const days_tr = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
		const days_en = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const days = $locale === 'tr' ? days_tr : days_en;
		return days[date.getDay()];
	}

	function getGradient(code) {
		if (code === 0 || code === 1) return 'linear-gradient(135deg, #4A90D9 0%, #67B8F0 50%, #89CFF0 100%)';
		if (code === 2 || code === 3) return 'linear-gradient(135deg, #6B7B8D 0%, #8E99A4 50%, #A8B5C2 100%)';
		if (code >= 45 && code <= 48) return 'linear-gradient(135deg, #8E99A4 0%, #B0B8C0 100%)';
		if (code >= 51 && code <= 67) return 'linear-gradient(135deg, #4A6B8A 0%, #6B8BAA 50%, #8EAAC4 100%)';
		if (code >= 71 && code <= 86) return 'linear-gradient(135deg, #B0C4D8 0%, #D0DCE8 50%, #E8EEF4 100%)';
		if (code >= 95) return 'linear-gradient(135deg, #3A4A5C 0%, #4A5A6C 50%, #5A6A7C 100%)';
		return 'linear-gradient(135deg, #4A90D9 0%, #67B8F0 100%)';
	}
</script>

{#if weatherData?.length}
	<section class="weather-section" aria-label={$locale === 'tr' ? 'Hava Durumu' : 'Weather'}>
		<div class="weather-header">
			<h2 class="weather-title">{$locale === 'tr' ? 'Hava Durumu' : 'Weather'}</h2>
			<div class="city-tabs">
				{#each weatherData as w, i}
					<button
						class="city-tab"
						class:active={selectedCity === i}
						on:click={() => { selectedCity = i; showForecast = false; }}
					>
						{w.city}
					</button>
				{/each}
			</div>
		</div>

		{#if city}
			{#key selectedCity}
				<div
					class="weather-card"
					style="background: {getGradient(city.current.weather_code ?? 0)}"
					in:fade={{ duration: 300 }}
				>
					<div class="weather-glass-overlay"></div>
					<div class="card-content">
						<div class="card-top">
							<div class="city-info">
								<span class="city-name">{city.city}</span>
								<span class="condition">{city.current.description}</span>
							</div>
							<div class="temp-big">
								<span class="weather-emoji">{city.current.icon}</span>
								<span class="temp-value">{city.current.temp}°</span>
							</div>
						</div>

						<div class="card-details">
							<div class="detail-item">
								<span class="detail-label">{$locale === 'tr' ? 'Hissedilen' : 'Feels like'}</span>
								<span class="detail-value">{city.current.feelsLike}°</span>
							</div>
							<div class="detail-divider"></div>
							<div class="detail-item">
								<span class="detail-label">{$locale === 'tr' ? 'Nem' : 'Humidity'}</span>
								<span class="detail-value">{city.current.humidity}%</span>
							</div>
							<div class="detail-divider"></div>
							<div class="detail-item">
								<span class="detail-label">{$locale === 'tr' ? 'Rüzgar' : 'Wind'}</span>
								<span class="detail-value">{city.current.windSpeed} km/h</span>
							</div>
						</div>

						{#if city.forecast?.length > 0}
							<button
								class="forecast-toggle"
								on:click={() => showForecast = !showForecast}
							>
								{showForecast
									? ($locale === 'tr' ? 'Gizle' : 'Hide')
									: ($locale === 'tr' ? '5 Günlük Tahmin' : '5-Day Forecast')}
								<span class="toggle-arrow" class:open={showForecast}>›</span>
							</button>
						{/if}

						{#if showForecast && city.forecast?.length > 0}
							<div class="forecast-strip" in:fly={{ y: -10, duration: 250 }}>
								{#each city.forecast as day, i}
									<div class="forecast-day" style="animation-delay: {i * 50}ms">
										<span class="forecast-day-name">{formatDay(day.date)}</span>
										<span class="forecast-icon">{day.icon}</span>
										<div class="forecast-temps">
											<span class="forecast-high">{day.maxTemp}°</span>
											<span class="forecast-low">{day.minTemp}°</span>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/key}
		{/if}
	</section>
{/if}

<style>
	.weather-section {
		padding: 0 0 1rem;
	}

	.weather-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.weather-title {
		font-family: var(--font-main);
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 600;
		letter-spacing: -0.045em;
		line-height: 1.05;
		color: var(--fg);
		margin: 0;
	}

	.city-tabs {
		display: flex;
		gap: 4px;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.city-tabs::-webkit-scrollbar { display: none; }

	.city-tab {
		background: rgba(0, 0, 0, 0.04);
		border: none;
		color: var(--fg);
		padding: 6px 14px;
		font-size: 0.8125rem;
		font-weight: 500;
		border-radius: 980px;
		cursor: pointer;
		transition: background 0.2s, color 0.2s;
		white-space: nowrap;
		font-family: var(--font-text);
	}

	:global([prefers-color-scheme='dark']) .city-tab {
		background: rgba(255, 255, 255, 0.08);
	}

	.city-tab:hover {
		background: rgba(0, 0, 0, 0.08);
	}

	:global([prefers-color-scheme='dark']) .city-tab:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	.city-tab.active {
		background: var(--fg);
		color: var(--bg);
		font-weight: 600;
	}

	.weather-card {
		position: relative;
		border-radius: 20px;
		overflow: hidden;
		color: #fff;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
		transition: transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.35s;
	}

	.weather-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.weather-glass-overlay {
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(1px);
		pointer-events: none;
	}

	.card-content {
		position: relative;
		padding: 1.75rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.city-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.city-name {
		font-size: 1.375rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.condition {
		font-size: 0.875rem;
		opacity: 0.85;
		font-weight: 400;
	}

	.temp-big {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.weather-emoji {
		font-size: 2.75rem;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
	}

	.temp-value {
		font-size: 4rem;
		font-weight: 200;
		letter-spacing: -0.05em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.card-details {
		display: flex;
		align-items: center;
		gap: 0;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		padding: 12px 0;
		backdrop-filter: blur(8px);
	}

	.detail-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.detail-label {
		font-size: 0.6875rem;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 500;
	}

	.detail-value {
		font-size: 1rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.detail-divider {
		width: 1px;
		height: 28px;
		background: rgba(255, 255, 255, 0.2);
	}

	.forecast-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: rgba(255, 255, 255, 0.12);
		border: none;
		color: #fff;
		padding: 8px 16px;
		border-radius: 980px;
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 600;
		font-family: var(--font-text);
		transition: background 0.2s;
		align-self: center;
	}

	.forecast-toggle:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.toggle-arrow {
		font-size: 1.1rem;
		transition: transform 0.25s;
		display: inline-block;
	}

	.toggle-arrow.open {
		transform: rotate(90deg);
	}

	.forecast-strip {
		display: flex;
		gap: 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		padding-top: 1rem;
	}

	.forecast-day {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		animation: fadeInUp 0.3s ease-out backwards;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.forecast-day-name {
		font-size: 0.75rem;
		font-weight: 600;
		opacity: 0.8;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.forecast-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.forecast-temps {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.forecast-high {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.forecast-low {
		font-size: 0.75rem;
		opacity: 0.6;
	}

	@media (max-width: 734px) {
		.weather-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.card-content {
			padding: 1.25rem 1.25rem;
		}

		.temp-value {
			font-size: 3rem;
		}

		.weather-emoji {
			font-size: 2rem;
		}

		.forecast-strip {
			overflow-x: auto;
			scrollbar-width: none;
			-webkit-overflow-scrolling: touch;
			gap: 4px;
		}

		.forecast-strip::-webkit-scrollbar { display: none; }

		.forecast-day {
			min-width: 56px;
		}
	}
</style>
