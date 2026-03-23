<script>
	import { fade, fly } from 'svelte/transition';
	import { t } from '$lib/i18n';

	export let isOpen = false;
	export let close;

	let searchQuery = '';
	let results = [];
	let isSearching = false;
	let inputElement;

	const quickLinks = [
		{ labelKey: 'nav.world', href: '/dunya' },
		{ labelKey: 'nav.turkey', href: '/turkiye' },
		{ labelKey: 'nav.technology', href: '/teknoloji' },
		{ labelKey: 'nav.economy', href: '/ekonomi' },
		{ labelKey: 'nav.sports', href: '/spor' },
		{ labelKey: 'nav.finance', href: '/finans' },
		{ labelKey: 'nav.allSources', href: '/kaynak' }
	];

	$: if (isOpen && inputElement) {
		setTimeout(() => inputElement.focus(), 80);
	}

	async function handleSearch() {
		if (searchQuery.length < 2) {
			results = [];
			return;
		}

		isSearching = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
			results = await res.json();
		} catch (e) {
			console.error('Search error:', e);
		} finally {
			isSearching = false;
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') close();
	}

	let debounceTimer;
	$: {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (searchQuery) handleSearch();
			else results = [];
		}, 300);
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="overlay"
		transition:fade={{ duration: 280 }}
		on:click|self={close}
		role="presentation"
	>
		<div class="overlay-inner" transition:fly={{ y: -12, duration: 380, easing: (t) => 1 - Math.pow(1 - t, 3) }}>
			<div class="search-shell container">
				<div class="search-bar">
					<div class="input-shell">
						<svg class="search-glyph" width="20" height="20" viewBox="0 0 15 15" fill="none" aria-hidden="true">
							<path
								d="M14.5 14.5L10.5 10.5M12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5Z"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<input
							bind:this={inputElement}
							bind:value={searchQuery}
							type="search"
							autocomplete="off"
							placeholder={$t('search.placeholder')}
							class="search-field"
							aria-label={$t('search.placeholder')}
						/>
						{#if isSearching}
							<div class="spinner" aria-hidden="true"></div>
						{/if}
					</div>
					<button type="button" class="cancel" on:click={close}>{$t('search.cancel')}</button>
				</div>

				<div class="search-scroll">
					{#if searchQuery === ''}
						<div class="hints" in:fade={{ delay: 120, duration: 200 }}>
							<p class="hints-label">{$t('search.quickLinks')}</p>
							<ul class="hints-list">
								{#each quickLinks as link}
									<li>
										<a href={link.href} class="hint-link" on:click={close}>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
												<path d="M7 17l9.2-9.2M17 17V7H7" stroke-linecap="round" stroke-linejoin="round" />
											</svg>
											{$t(link.labelKey)}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{:else if results.length > 0}
						<div class="results" in:fade={{ duration: 200 }}>
							<ul class="result-list">
								{#each results as article}
									<li>
										<a href={article.link} target="_blank" rel="noopener noreferrer" class="result-card" on:click={close}>
											<div class="result-thumb">
												<img src={article.image} alt="" loading="lazy" />
											</div>
											<div class="result-copy">
												<span class="result-eyebrow">{article.category}</span>
												<h3 class="result-title">{article.title}</h3>
												<p class="result-meta">
													<span>{article.source}</span>
													<span class="sep">•</span>
													<span>{article.formattedDate}</span>
												</p>
											</div>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{:else if searchQuery.length >= 2 && !isSearching}
						<p class="empty" in:fade>{$t('search.noResults')}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.78);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
	}

	@media (prefers-color-scheme: dark) {
		.overlay {
			background: rgba(22, 22, 24, 0.72);
		}
	}

	.overlay-inner {
		width: 100%;
		padding-top: calc(var(--nav-height, 52px) + 16px);
		padding-bottom: env(safe-area-inset-bottom, 0);
	}

	.search-shell {
		max-width: var(--apple-container, 980px) !important;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.input-shell {
		position: relative;
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		background: var(--glass-bg);
		border: 1px solid var(--card-border);
		border-radius: 12px;
		padding: 4px 12px 4px 4px;
		box-shadow: var(--apple-tile-shadow);
	}

	.search-glyph {
		position: absolute;
		left: 14px;
		color: var(--apple-eyebrow);
		pointer-events: none;
	}

	.search-field {
		width: 100%;
		background: transparent;
		border: none;
		padding: 14px 14px 14px 44px;
		font-family: var(--font-main);
		font-size: clamp(1.25rem, 2.5vw, 1.65rem);
		font-weight: 600;
		letter-spacing: -0.035em;
		color: var(--fg);
		outline: none;
	}

	.search-field::placeholder {
		color: var(--apple-eyebrow);
		opacity: 1;
	}

	.cancel {
		flex-shrink: 0;
		background: none;
		border: none;
		color: var(--apple-blue);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		padding: 10px 14px;
		border-radius: 980px;
		transition:
			background 0.2s ease,
			opacity 0.2s ease;
		opacity: 1;
	}

	.cancel:hover {
		background: rgba(0, 102, 204, 0.08);
		opacity: 1;
	}

	@media (prefers-color-scheme: dark) {
		.cancel:hover {
			background: rgba(10, 132, 255, 0.15);
		}
	}

	.search-scroll {
		max-height: min(70vh, 640px);
		overflow-y: auto;
		padding-bottom: 3rem;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.search-scroll::-webkit-scrollbar {
		display: none;
	}

	.hints-label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--apple-eyebrow);
		margin: 0 0 1rem;
	}

	.hints-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.hint-link {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 1.05rem;
		font-weight: 500;
		color: var(--fg);
		padding: 12px 14px;
		margin-left: -14px;
		border-radius: 12px;
		text-decoration: none;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
		opacity: 1;
	}

	.hint-link:hover {
		background: rgba(0, 102, 204, 0.06);
		color: var(--apple-blue);
		transform: translateX(4px);
		opacity: 1;
	}

	@media (prefers-color-scheme: dark) {
		.hint-link:hover {
			background: rgba(10, 132, 255, 0.12);
		}
	}

	.result-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.result-card {
		display: flex;
		gap: 1.25rem;
		padding: 1rem 1.15rem;
		border-radius: 18px;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		box-shadow: var(--apple-tile-shadow);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
			box-shadow 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
			border-color 0.2s ease;
		opacity: 1;
	}

	.result-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--apple-tile-shadow-hover);
		border-color: rgba(0, 102, 204, 0.35);
		opacity: 1;
	}

	@media (prefers-color-scheme: dark) {
		.result-card:hover {
			border-color: rgba(10, 132, 255, 0.4);
		}
	}

	.result-thumb {
		width: 132px;
		height: 84px;
		border-radius: 12px;
		overflow: hidden;
		flex-shrink: 0;
		background: var(--apple-gray-200);
	}

	@media (prefers-color-scheme: dark) {
		.result-thumb {
			background: var(--apple-gray-500);
		}
	}

	.result-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.result-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 6px;
		min-width: 0;
	}

	.result-eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--apple-blue);
	}

	.result-title {
		font-family: var(--font-main);
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.35;
		letter-spacing: -0.02em;
		margin: 0;
		color: var(--fg);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.result-meta {
		font-size: 0.8125rem;
		color: var(--apple-eyebrow);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.sep {
		opacity: 0.45;
	}

	.empty {
		text-align: center;
		padding: 4rem 1.5rem;
		color: var(--apple-eyebrow);
		font-size: 1.05rem;
		margin: 0;
	}

	.spinner {
		width: 22px;
		height: 22px;
		border: 2.5px solid var(--apple-blue);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.75s linear infinite;
		margin-right: 10px;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.result-thumb {
			display: none;
		}

		.overlay-inner {
			padding-top: calc(var(--nav-height, 52px) + 8px);
		}

		.search-field {
			font-size: 1.2rem;
		}
	}
</style>
