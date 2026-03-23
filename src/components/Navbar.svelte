<script>
	import { page } from '$app/stores';
	import { locale, t } from '$lib/i18n';
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import SearchOverlay from './SearchOverlay.svelte';

	/** @type {Array<{ path: string; labelKey: string; internal: string; sources: Array<{ name: string; slug: string }>; }>} */
	export let feedNav = [];

	/** @type {any[] | null} */
	export let weatherData = null;

	let weatherCity = 0;
	let weatherOpen = false;
	let weatherCloseTimer = 0;

	$: weather = weatherData?.[weatherCity] ?? null;

	function weatherEnter() {
		if (typeof window !== 'undefined') window.clearTimeout(weatherCloseTimer);
		weatherOpen = true;
	}
	function weatherLeave() {
		if (typeof window === 'undefined') return;
		weatherCloseTimer = window.setTimeout(() => { weatherOpen = false; }, 250);
	}

	async function refreshNavWeather() {
		try {
			const res = await fetch('/api/weather');
			const data = await res.json();
			if (data?.length) weatherData = data;
		} catch { /* silent */ }
	}

	let isSearchOpen = false;
	let mobileMenuOpen = false;

	$: pathname = $page.url.pathname;
	$: activeSlugs = $page.url.searchParams.getAll('kaynak');
	$: kaynakSlug = /^\/kaynak\/([^/]+)$/.exec(pathname)?.[1] ?? null;

	/* ── scroll-aware hide/show (iPhone-style) ── */
	const SCROLL_DELTA = 12;
	const TOP_ZONE = 60;
	let lastScrollY = 0;
	let navHidden = false;

	function onScroll() {
		if (mobileMenuOpen || isSearchOpen) return;
		const y = window.scrollY;
		const delta = y - lastScrollY;
		lastScrollY = y;
		if (y < TOP_ZONE) { navHidden = false; return; }
		if (delta > SCROLL_DELTA) navHidden = true;
		else if (delta < -SCROLL_DELTA) navHidden = false;
	}

	function toggleSearch() {
		isSearchOpen = !isSearchOpen;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = isSearchOpen ? 'hidden' : '';
		}
		if (isSearchOpen) navHidden = false;
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		openMega = null;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
		}
		if (mobileMenuOpen) navHidden = false;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			if (openMega) { openMega = null; return; }
			closeMobileMenu();
			if (isSearchOpen) toggleSearch();
		}
	}

	async function toggleLocale() {
		const newLocale = $locale === 'tr' ? 'en' : 'tr';
		locale.set(newLocale);
		if (typeof document !== 'undefined') {
			document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
			await invalidateAll();
		}
	}

	/** @param {string} slug */
	function sourcePageHref(slug) { return `/kaynak/${slug}`; }
	/** @param {string} slug */
	function isSourceActive(slug) { return kaynakSlug === slug || activeSlugs.includes(slug); }
	/** @param {{ path: string; sources?: Array<{ slug: string }> }} col */
	function isCategoryNavActive(col) {
		if (pathname === col.path) return true;
		if (!kaynakSlug || !col.sources?.length) return false;
		return col.sources.some((s) => s.slug === kaynakSlug);
	}
	/** @param {{ sources?: Array<{ slug: string }> }} col */
	function isViewingSourceInColumn(col) {
		return !!(kaynakSlug && col.sources?.some((s) => s.slug === kaynakSlug));
	}

	/** @type {string | null} */
	let openMega = null;
	let megaCloseTimer = 0;

	/** @param {string} id */
	function megaEnter(id) {
		if (typeof window !== 'undefined') window.clearTimeout(megaCloseTimer);
		openMega = id;
	}
	function megaLeave() {
		if (typeof window === 'undefined') return;
		megaCloseTimer = window.setTimeout(() => { openMega = null; }, 200);
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.clearTimeout(megaCloseTimer);
			window.clearTimeout(weatherCloseTimer);
		}
	});

	onMount(() => {
		if (typeof document !== 'undefined') {
			const cookies = document.cookie.split('; ');
			const localeCookie = cookies.find((c) => c.startsWith('locale='));
			if (localeCookie) locale.set(localeCookie.split('=')[1]);
		}
		lastScrollY = window.scrollY;
		window.addEventListener('scroll', onScroll, { passive: true });
		if (!weatherData) refreshNavWeather();
		const weatherInterval = setInterval(refreshNavWeather, 10 * 60_000);
		return () => {
			window.removeEventListener('scroll', onScroll);
			clearInterval(weatherInterval);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="nav-shell" class:nav-shell--hidden={navHidden}>
	<nav class="globalnav" aria-label="Global">
		<div class="globalnav-content container">
			<a href="/" class="logo" on:click={closeMobileMenu}>
				<img src="/logo.png" alt="MertNews" class="logo-icon" width="22" height="22" />
				<span class="logo-text">Mert<span>News</span></span>
			</a>

			<div class="nav-links desktop-nav" aria-label="{$t('footer.news')}">
				<!-- Tetikleyiciler — paneller nav-mega-layer’da (overflow/mask kırpmaz) -->
				<div
					class="flyout-wrap has-panel mega-hover"
					class:flyout-wrap--open={openMega === 'home'}
					role="presentation"
					on:mouseenter={() => megaEnter('home')}
					on:mouseleave={megaLeave}
				>
					<a
						href="/"
						class="nav-link nav-link--trigger"
						class:active={pathname === '/' && activeSlugs.length === 0}
						aria-haspopup="true"
						aria-expanded={openMega === 'home' ? 'true' : 'false'}
						data-sveltekit-preload-data="hover">{$t('nav.home')}</a>
				</div>

				{#each feedNav as col}
					<div
						class="flyout-wrap has-panel mega-hover"
						class:flyout-wrap--open={openMega === col.internal}
						role="presentation"
						on:mouseenter={() => megaEnter(col.internal)}
						on:mouseleave={megaLeave}
					>
						<a
							href={col.path}
							class="nav-link nav-link--trigger"
							class:active={isCategoryNavActive(col)}
							aria-haspopup="true"
							aria-expanded={openMega === col.internal ? 'true' : 'false'}
							data-sveltekit-preload-data="hover">{$t(col.labelKey)}</a>
					</div>
				{/each}

				<div
					class="flyout-wrap has-panel mega-hover"
					class:flyout-wrap--open={openMega === 'finans'}
					role="presentation"
					on:mouseenter={() => megaEnter('finans')}
					on:mouseleave={megaLeave}
				>
					<a
						href="/finans"
						class="nav-link nav-link--trigger"
						class:active={pathname === '/finans'}
						aria-haspopup="true"
						aria-expanded={openMega === 'finans' ? 'true' : 'false'}
						data-sveltekit-preload-data="hover">{$t('nav.finance')}</a>
				</div>
			</div>

		<div class="nav-actions">
			<button
				type="button"
				class="menu-toggle"
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-nav-drawer"
				on:click={toggleMobileMenu}
			>
				{#if mobileMenuOpen}
					<span class="menu-toggle-text">{$t('nav.closeMenu')}</span>
				{:else}
					<span class="menu-toggle-text">{$t('nav.openMenu')}</span>
				{/if}
				<span class="menu-burger" class:menu-burger--open={mobileMenuOpen} aria-hidden="true">
					<span></span>
					<span></span>
				</span>
			</button>

			{#if weather}
				<div
					class="nav-weather-wrap"
					on:mouseenter={weatherEnter}
					on:mouseleave={weatherLeave}
					role="presentation"
				>
					<button
						class="nav-weather-pill"
						type="button"
						aria-expanded={weatherOpen}
						on:click={() => weatherOpen = !weatherOpen}
					>
						<span class="nav-weather-icon">{weather.current.icon}</span>
						<span class="nav-weather-temp">{weather.current.temp}°</span>
					</button>

					{#if weatherOpen}
						<div
							class="nav-weather-dropdown"
							on:mouseenter={weatherEnter}
							on:mouseleave={weatherLeave}
						>
							<div class="nw-dropdown-arrow"></div>
							<div class="nw-card" class:nw-card--animate={weatherOpen}>
								<div class="nw-city-selector nw-stagger nw-stagger-1">
									{#each weatherData as w, i}
										<button
											class="nw-city-btn"
											class:active={weatherCity === i}
											on:click={() => weatherCity = i}
										>{w.city}</button>
									{/each}
								</div>

								{#key weatherCity}
									<div class="nw-main nw-stagger nw-stagger-2">
										<div class="nw-left">
											<span class="nw-city-name nw-text-reveal">{weather.city}</span>
											<span class="nw-condition nw-text-reveal" style="animation-delay: 0.08s">{weather.current.description}</span>
										</div>
										<div class="nw-right">
											<span class="nw-big-icon nw-icon-pop">{weather.current.icon}</span>
											<span class="nw-big-temp nw-temp-reveal">{weather.current.temp}°</span>
										</div>
									</div>

									<div class="nw-details nw-stagger nw-stagger-3">
										<div class="nw-detail nw-detail-anim" style="animation-delay: 0.12s">
											<span class="nw-detail-label">{$locale === 'tr' ? 'Hissedilen' : 'Feels'}</span>
											<span class="nw-detail-val">{weather.current.feelsLike}°</span>
										</div>
										<div class="nw-detail-sep"></div>
										<div class="nw-detail nw-detail-anim" style="animation-delay: 0.17s">
											<span class="nw-detail-label">{$locale === 'tr' ? 'Nem' : 'Humid.'}</span>
											<span class="nw-detail-val">{weather.current.humidity}%</span>
										</div>
										<div class="nw-detail-sep"></div>
										<div class="nw-detail nw-detail-anim" style="animation-delay: 0.22s">
											<span class="nw-detail-label">{$locale === 'tr' ? 'Rüzgar' : 'Wind'}</span>
											<span class="nw-detail-val">{weather.current.windSpeed}<small>km/h</small></span>
										</div>
									</div>

									{#if weather.forecast?.length}
										<div class="nw-forecast nw-stagger nw-stagger-4">
											{#each weather.forecast.slice(0, 5) as day, fi}
												<div class="nw-fday nw-fday-anim" style="animation-delay: {0.18 + fi * 0.05}s">
													<span class="nw-fday-name">{(() => {
														const d = new Date(day.date + 'T12:00:00');
														const today = new Date().toISOString().split('T')[0];
														if (day.date === today) return $locale === 'tr' ? 'Bugün' : 'Today';
														const names_tr = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
														const names_en = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
														return ($locale === 'tr' ? names_tr : names_en)[d.getDay()];
													})()}</span>
													<span class="nw-fday-icon">{day.icon}</span>
													<span class="nw-fday-temps">
														<span class="nw-fday-hi">{day.maxTemp}°</span>
														<span class="nw-fday-lo">{day.minTemp}°</span>
													</span>
												</div>
											{/each}
										</div>
									{/if}
								{/key}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<button class="icon-btn" type="button" on:click={toggleLocale} title="Dil / Language">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
							stroke="currentColor"
							stroke-width="1.5"
						/>
						<path d="M2 12H22" stroke="currentColor" stroke-width="1.5" />
						<path
							d="M12 2C14.5 4.74 15.92 8.29 16 12C15.92 15.71 14.5 19.26 12 22C9.5 19.26 8.08 15.71 8 12C8.08 8.29 9.5 4.74 12 2Z"
							stroke="currentColor"
							stroke-width="1.5"
						/>
					</svg>
					<span class="lang-label">{$locale.toUpperCase()}</span>
				</button>
				<button class="icon-btn" type="button" on:click={toggleSearch} aria-label="Search">
					<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
						<path
							d="M14.5 14.5L10.5 10.5M12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5Z"
							stroke="currentColor"
							stroke-linecap="round"
						/>
					</svg>
				</button>
				<a href="/abone" class="nav-cta" data-sveltekit-preload-data="hover">{$t('nav.subscribe')}</a>
			</div>
		</div>
	</nav>

	<!-- apple.com Store tarzı: bulanık arka plan + beyaz üç sütun panel -->
	<div class="nav-mega-layer" class:nav-mega-layer--open={openMega != null}>
		<div
			class="nav-mega-backdrop"
			class:nav-mega-backdrop--open={openMega != null}
			aria-hidden="true"
		></div>

		<div
			class="flyout-panel flyout-panel--apple flyout-panel--store"
			class:flyout-panel--open={openMega === 'home'}
			role="region"
			aria-label={$t('nav.home')}
			data-mega-panel="home"
			on:mouseenter={() => megaEnter('home')}
			on:mouseleave={megaLeave}
		>
			<div class="flyout-hitbridge" aria-hidden="true"></div>
			<div class="flyout-inner flyout-inner--mega flyout-inner--store">
				<div class="store-mega mega-animate" class:mega-animate-active={openMega === 'home'}>
					<div class="store-mega-grid">
						<div class="store-mega-col">
							<p class="store-mega-eyebrow">{$t('nav.mega.colExplore')}</p>
							<ul class="store-mega-list store-mega-list--primary">
								<li>
									<a href="/" class="store-link store-link--display" data-sveltekit-preload-data="hover"
										>{$t('section.latest')}</a>
								</li>
								{#each feedNav as c}
									<li>
										<a
											href={c.path}
											class="store-link store-link--display"
											class:is-active={isCategoryNavActive(c)}
											data-sveltekit-preload-data="hover">{$t(c.labelKey)}</a>
									</li>
								{/each}
							</ul>
						</div>
						<div class="store-mega-col">
							<p class="store-mega-eyebrow">{$t('nav.mega.colQuickLinks')}</p>
							<ul class="store-mega-list">
								<li>
									<a
										href="/finans"
										class="store-link"
										class:is-active={pathname === '/finans'}
										data-sveltekit-preload-data="hover">{$t('nav.finance')}</a>
								</li>
								<li>
									<a
										href="/abone"
										class="store-link"
										class:is-active={pathname === '/abone'}
										data-sveltekit-preload-data="hover">{$t('nav.subscribe')}</a>
								</li>
								<li>
									<a href="/yardim" class="store-link" data-sveltekit-preload-data="hover"
										>{$t('footer.help')}</a>
								</li>
								<li>
									<a
										href="/kaynak"
										class="store-link"
										class:is-active={pathname === '/kaynak' || pathname.startsWith('/kaynak/')}
										data-sveltekit-preload-data="hover">{$t('nav.allSources')}</a>
								</li>
							</ul>
						</div>
						<div class="store-mega-col">
							<p class="store-mega-eyebrow">{$t('nav.mega.colMoreExplore')}</p>
							<ul class="store-mega-list">
								<li>
									<a href="/iletisim" class="store-link" data-sveltekit-preload-data="hover"
										>{$t('footer.contact')}</a>
								</li>
								<li>
									<a href="/hakkimizda" class="store-link" data-sveltekit-preload-data="hover"
										>{$t('footer.about')}</a>
								</li>
								<li>
									<a href="/gizlilik" class="store-link" data-sveltekit-preload-data="hover"
										>{$t('footer.privacy')}</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

		{#each feedNav as col}
			{#if col.sources?.length}
				<div
					class="flyout-panel flyout-panel--apple flyout-panel--store"
					class:flyout-panel--open={openMega === col.internal}
					role="region"
					aria-label="{$t(col.labelKey)} — {$t('nav.sourcesFor')}"
					data-mega-panel={col.internal}
					on:mouseenter={() => megaEnter(col.internal)}
					on:mouseleave={megaLeave}
				>
					<div class="flyout-hitbridge" aria-hidden="true"></div>
					<div class="flyout-inner flyout-inner--mega flyout-inner--store">
						<div
							class="store-mega mega-animate"
							class:mega-animate-active={openMega === col.internal}
						>
							<div class="store-mega-grid">
								<div class="store-mega-col">
									<p class="store-mega-eyebrow">{$t('nav.mega.colExplore')}</p>
									<ul class="store-mega-list store-mega-list--primary">
										<li>
											<a
												href={col.path}
												class="store-link store-link--display"
												class:is-active={pathname === col.path &&
													activeSlugs.length === 0 &&
													!isViewingSourceInColumn(col)}
												data-sveltekit-preload-data="hover">{$t('nav.allStories')}</a>
										</li>
										<li>
											<a
												href={col.path}
												class="store-link store-link--display"
												class:is-active={isCategoryNavActive(col)}
												data-sveltekit-preload-data="hover">{$t(col.labelKey)}</a>
										</li>
									</ul>
								</div>
								<div class="store-mega-col">
									<p class="store-mega-eyebrow">{$t('nav.mega.colQuickLinks')}</p>
									<ul class="store-mega-list">
										<li>
											<a href="/" class="store-link" data-sveltekit-preload-data="hover"
												>{$t('nav.home')}</a>
										</li>
										<li>
											<a href="/finans" class="store-link" data-sveltekit-preload-data="hover"
												>{$t('nav.finance')}</a>
										</li>
										<li>
											<a href={col.path} class="store-link" data-sveltekit-preload-data="hover"
												>{$t('nav.mega.viewFullFeed')}</a>
										</li>
									</ul>
								</div>
								<div class="store-mega-col">
									<p class="store-mega-eyebrow">{$t('nav.sourcesFor')}</p>
									<ul class="store-mega-list store-mega-list--sources">
										{#each col.sources as s}
											<li>
												<a
													href={sourcePageHref(s.slug)}
													class="store-link"
													class:is-active={isSourceActive(s.slug)}
													data-sveltekit-preload-data="hover">{s.name}</a>
											</li>
										{/each}
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="flyout-panel flyout-panel--apple flyout-panel--store"
					class:flyout-panel--open={openMega === col.internal}
					role="region"
					data-mega-panel={col.internal}
					on:mouseenter={() => megaEnter(col.internal)}
					on:mouseleave={megaLeave}
				>
					<div class="flyout-hitbridge" aria-hidden="true"></div>
					<div class="flyout-inner flyout-inner--mega flyout-inner--store">
						<div
							class="store-mega mega-animate"
							class:mega-animate-active={openMega === col.internal}
						>
							<div class="store-mega-grid">
								<div class="store-mega-col">
									<p class="store-mega-eyebrow">{$t('nav.mega.colExplore')}</p>
									<ul class="store-mega-list store-mega-list--primary">
										<li>
										<a
											href={col.path}
											class="store-link store-link--display"
											class:is-active={isCategoryNavActive(col)}
											data-sveltekit-preload-data="hover">{$t('nav.mega.sportsHeadline')}</a>
										</li>
										<li>
											<a href={col.path} class="store-link store-link--display" data-sveltekit-preload-data="hover"
												>{$t('nav.mega.sportsCta')}</a>
										</li>
									</ul>
								</div>
								<div class="store-mega-col">
									<p class="store-mega-eyebrow">{$t('nav.mega.colQuickLinks')}</p>
									<ul class="store-mega-list">
										<li>
											<a href="/" class="store-link" data-sveltekit-preload-data="hover"
												>{$t('nav.home')}</a>
										</li>
										<li>
											<a href="/finans" class="store-link" data-sveltekit-preload-data="hover"
												>{$t('nav.finance')}</a>
										</li>
										<li>
											<a href="/abone" class="store-link" data-sveltekit-preload-data="hover"
												>{$t('nav.subscribe')}</a>
										</li>
									</ul>
								</div>
								<div class="store-mega-col">
									<p class="store-mega-eyebrow">{$t('nav.mega.colMoreExplore')}</p>
									<ul class="store-mega-list">
										<li>
											<span class="store-mega-muted">{$t('nav.mega.sportsSub')}</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/each}

		<div
			class="flyout-panel flyout-panel--apple flyout-panel--store"
			class:flyout-panel--open={openMega === 'finans'}
			role="region"
			data-mega-panel="finans"
			on:mouseenter={() => megaEnter('finans')}
			on:mouseleave={megaLeave}
		>
			<div class="flyout-hitbridge" aria-hidden="true"></div>
			<div class="flyout-inner flyout-inner--mega flyout-inner--store">
				<div class="store-mega mega-animate" class:mega-animate-active={openMega === 'finans'}>
					<div class="store-mega-grid">
						<div class="store-mega-col">
							<p class="store-mega-eyebrow">{$t('nav.mega.colExplore')}</p>
							<ul class="store-mega-list store-mega-list--primary">
								<li>
									<a
										href="/finans"
										class="store-link store-link--display"
										class:is-active={pathname === '/finans'}
										data-sveltekit-preload-data="hover">{$t('nav.mega.financeHeadline')}</a>
								</li>
								<li>
									<a href="/finans" class="store-link store-link--display" data-sveltekit-preload-data="hover"
										>{$t('nav.mega.financeCta')}</a>
								</li>
							</ul>
						</div>
						<div class="store-mega-col">
							<p class="store-mega-eyebrow">{$t('nav.mega.colQuickLinks')}</p>
							<ul class="store-mega-list">
								<li>
									<a href="/" class="store-link" data-sveltekit-preload-data="hover">{$t('nav.home')}</a>
								</li>
								<li>
									<a href="/abone" class="store-link" data-sveltekit-preload-data="hover"
										>{$t('nav.subscribe')}</a>
								</li>
								<li>
									<a href="/spor" class="store-link" data-sveltekit-preload-data="hover">{$t('nav.sports')}</a>
								</li>
							</ul>
						</div>
						<div class="store-mega-col">
							<p class="store-mega-eyebrow">{$t('nav.mega.colMoreExplore')}</p>
							<ul class="store-mega-list">
								<li>
									<span class="store-mega-muted">{$t('nav.mega.financeSub')}</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

</div>

{#if mobileMenuOpen}
	<div
		id="mobile-nav-drawer"
		class="mobile-drawer"
		role="dialog"
		aria-modal="true"
		aria-label="{$t('nav.openMenu')}"
	>
		<div class="mobile-drawer-scroll">
			<a href="/" class="mobile-home" on:click={closeMobileMenu}>{$t('nav.home')}</a>
			<a href="/kaynak" class="mobile-home mobile-sources" on:click={closeMobileMenu}
				>{$t('nav.allSources')}</a
			>

			{#each feedNav as col}
				<section class="mobile-section">
					<div class="mobile-section-head">
						<a href={col.path} class="mobile-cat-title" on:click={closeMobileMenu}
							>{$t(col.labelKey)}</a>
						{#if col.sources?.length}
							<p class="mobile-section-label">{$t('nav.sourcesFor')}</p>
							<div class="mobile-source-chips">
								<a href={col.path} class="chip" on:click={closeMobileMenu}>{$t('nav.allStories')}</a>
								{#each col.sources as s}
									<a
										href={sourcePageHref(s.slug)}
										class="chip"
										class:active={isSourceActive(s.slug)}
										on:click={closeMobileMenu}>{s.name}</a>
								{/each}
							</div>
						{/if}
					</div>
				</section>
			{/each}

			<a href="/finans" class="mobile-home finans" on:click={closeMobileMenu}>{$t('nav.finance')}</a>
			<a href="/abone" class="mobile-cta" on:click={closeMobileMenu}>{$t('nav.subscribe')}</a>
		</div>
	</div>
	<button type="button" class="mobile-scrim" aria-label={$t('nav.closeMenu')} on:click={closeMobileMenu} />
{/if}

<SearchOverlay isOpen={isSearchOpen} close={toggleSearch} />

<style>
	.nav-shell {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9998;
		height: calc(var(--nav-height) + env(safe-area-inset-top, 0px));
		padding-top: env(safe-area-inset-top, 0px);
		overflow: visible;
		background: rgba(251, 251, 253, 0.82);
		backdrop-filter: saturate(180%) blur(20px);
		-webkit-backdrop-filter: saturate(180%) blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		transform: translateY(0);
		transition: transform 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
		will-change: transform;
	}

	.nav-shell--hidden {
		transform: translateY(-100%);
	}

	:global([prefers-color-scheme='dark']) .nav-shell {
		background: rgba(22, 22, 23, 0.88);
		border-bottom-color: rgba(255, 255, 255, 0.08);
	}

	.globalnav {
		position: relative;
		z-index: 10001;
		height: 100%;
		display: flex;
		align-items: center;
	}

	/* Mega: arka plan bulanık + beyaz panel (apple.com Store menü) */
	.nav-mega-layer {
		position: fixed;
		top: calc(var(--nav-height) + env(safe-area-inset-top, 0px));
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10000;
		pointer-events: none;
	}

	.nav-mega-layer--open {
		pointer-events: auto;
	}

	.nav-mega-backdrop {
		position: fixed;
		top: calc(var(--nav-height) + env(safe-area-inset-top, 0px));
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 0;
		background: rgba(255, 255, 255, 0.55);
		backdrop-filter: blur(40px) saturate(200%);
		-webkit-backdrop-filter: blur(40px) saturate(200%);
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.36s cubic-bezier(0.4, 0, 0.2, 1),
			visibility 0.36s;
		pointer-events: none;
	}

	.nav-mega-backdrop--open {
		opacity: 1;
		visibility: visible;
		pointer-events: none;
	}

	:global([prefers-color-scheme='dark']) .nav-mega-backdrop {
		background: rgba(0, 0, 0, 0.52);
		backdrop-filter: blur(48px) saturate(200%);
		-webkit-backdrop-filter: blur(48px) saturate(200%);
	}

	@media (max-width: 900px) {
		.nav-mega-layer {
			display: none !important;
		}
	}

	.globalnav-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		max-width: min(1024px, 100%);
		margin: 0 auto;
		padding: 0 max(12px, env(safe-area-inset-left)) 0 max(12px, env(safe-area-inset-right));
		gap: 0.5rem;
		height: 100%;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-main);
		font-weight: 600;
		font-size: 1.0625rem;
		letter-spacing: -0.022em;
		color: var(--fg);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.logo-icon {
		width: 22px;
		height: 22px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.logo-text span {
		font-weight: 400;
		opacity: 0.88;
	}

	.desktop-nav {
		display: flex;
		align-items: stretch;
		justify-content: center;
		gap: 0;
		flex: 1;
		min-width: 0;
		overflow: visible;
		scrollbar-width: none;
	}

	.desktop-nav::-webkit-scrollbar {
		display: none;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		font-family: var(--font-text);
		color: #1d1d1f;
		font-size: 12px;
		font-weight: 400;
		letter-spacing: -0.01em;
		padding: 0 10px;
		white-space: nowrap;
		transition: color 0.24s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 1;
		border: none;
		background: transparent;
		height: 100%;
	}

	:global([prefers-color-scheme='dark']) .nav-link {
		color: rgba(245, 245, 247, 0.82);
	}

	.nav-link:hover {
		color: #1d1d1f;
	}

	:global([prefers-color-scheme='dark']) .nav-link:hover {
		color: #f5f5f7;
	}

	.nav-link.active {
		color: #1d1d1f;
		font-weight: 600;
	}

	:global([prefers-color-scheme='dark']) .nav-link.active {
		color: #f5f5f7;
	}

	.nav-link--trigger {
		position: relative;
	}

	/* apple.com — açık menüde ince vurgu (isteğe bağlı) */
	.nav-link--trigger::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 3px;
		width: 0;
		height: 1px;
		background: currentColor;
		transform: translateX(-50%);
		opacity: 0;
		transition:
			width 0.24s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.2s ease;
	}

	@media (hover: hover) and (pointer: fine) {
		.flyout-wrap--open .nav-link--trigger::after {
			width: calc(100% - 8px);
			opacity: 0.45;
		}

		.nav-link--trigger.active::after {
			width: calc(100% - 8px);
			opacity: 0.5;
		}
	}

	.flyout-wrap--open .nav-link--trigger {
		color: #1d1d1f;
		font-weight: 600;
	}

	:global([prefers-color-scheme='dark']) .flyout-wrap--open .nav-link--trigger {
		color: #f5f5f7;
	}

	.flyout-wrap {
		position: static;
		display: flex;
		align-items: stretch;
		height: 100%;
	}

	/* apple.com Store menü — #fbfbfd panel, minimal gölge */
	.nav-mega-layer .flyout-panel {
		position: fixed;
		left: 0;
		right: 0;
		top: calc(var(--nav-height) + env(safe-area-inset-top, 0px));
		z-index: 2;
		max-height: min(72vh, 580px);
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0;
		background: var(--apple-mega-panel-light, #fbfbfd);
		border-bottom: 1px solid var(--apple-mega-border-light, #d2d2d7);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
		opacity: 0;
		visibility: hidden;
		transform: translateY(-4px);
		transition:
			opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.32s cubic-bezier(0.4, 0, 0.2, 1),
			visibility 0.28s;
		pointer-events: none;
	}

	.nav-mega-layer .flyout-panel.flyout-panel--open {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
		pointer-events: auto;
	}

	:global([prefers-color-scheme='dark']) .nav-mega-layer .flyout-panel {
		background: var(--apple-mega-panel-dark, #161617);
		border-bottom-color: var(--apple-mega-border-dark, rgba(255, 255, 255, 0.12));
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
	}

	.flyout-hitbridge {
		position: absolute;
		top: -20px;
		left: 0;
		right: 0;
		height: 20px;
		background: transparent;
		pointer-events: auto;
	}

	.mega-animate-active .store-mega-col {
		animation: appleMegaCol 0.36s cubic-bezier(0.4, 0, 0.2, 1) backwards;
	}

	.mega-animate-active .store-mega-col:nth-child(1) {
		animation-delay: 0.02s;
	}

	.mega-animate-active .store-mega-col:nth-child(2) {
		animation-delay: 0.05s;
	}

	.mega-animate-active .store-mega-col:nth-child(3) {
		animation-delay: 0.08s;
	}

	@keyframes appleMegaCol {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-mega-layer .flyout-panel {
			transition: opacity 0.15s ease, visibility 0.15s;
			transform: none !important;
		}

		.mega-animate-active .store-mega-col {
			animation: none !important;
		}
	}

	.flyout-inner--mega.flyout-inner--store {
		max-width: min(1024px, 100%);
		margin: 0 auto;
		padding: 44px max(22px, env(safe-area-inset-left)) 52px max(22px, env(safe-area-inset-right));
	}

	/* ——— apple.com Store: 3 sütun, geniş gutter ——— */
	.store-mega {
		font-family: var(--font-main);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.store-mega-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.88fr) minmax(0, 0.88fr);
		column-gap: min(4.5rem, 8vw);
		row-gap: 2rem;
		align-items: start;
	}

	.store-mega-col {
		min-width: 0;
	}

	.store-mega-eyebrow {
		font-family: var(--font-text);
		font-size: 12px;
		font-weight: 400;
		letter-spacing: -0.01em;
		text-transform: uppercase;
		color: #6e6e73;
		margin: 0 0 14px;
		line-height: 1.25;
	}

	:global([prefers-color-scheme='dark']) .store-mega-eyebrow {
		color: #a1a1a6;
	}

	.store-mega-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.store-mega-list--primary li + li {
		margin-top: 2px;
	}

	/* SF Pro Display – büyük vitrin satırları (~24px) */
	.store-link--display {
		display: block;
		font-family: var(--font-main);
		font-size: 24px;
		font-weight: 600;
		letter-spacing: 0.007em;
		line-height: 1.1667;
		color: #1d1d1f;
		padding: 5px 0 7px;
		border-radius: 4px;
		transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global([prefers-color-scheme='dark']) .store-link--display {
		color: #f5f5f7;
	}

	.store-link--display:hover,
	.store-link--display:focus-visible {
		color: var(--apple-blue);
		opacity: 1;
	}

	.store-link--display:focus-visible {
		outline: 2px solid var(--apple-blue);
		outline-offset: 2px;
	}

	.store-link--display.is-active {
		color: var(--apple-blue);
	}

	/* SF Pro Text – Quick Links 12px */
	.store-link {
		display: block;
		font-family: var(--font-text);
		font-size: 12px;
		font-weight: 400;
		letter-spacing: -0.01em;
		line-height: 16px;
		color: #1d1d1f;
		padding: 4px 0;
		border-radius: 4px;
		transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global([prefers-color-scheme='dark']) .store-link {
		color: #e8e8ed;
	}

	.store-link:hover,
	.store-link:focus-visible {
		color: var(--apple-blue);
		opacity: 1;
	}

	.store-link:focus-visible {
		outline: 2px solid var(--apple-blue);
		outline-offset: 1px;
	}

	.store-link.is-active {
		color: var(--apple-blue);
		font-weight: 600;
	}

	.store-mega-list--sources {
		max-height: min(48vh, 380px);
		overflow-y: auto;
		padding-right: 6px;
		margin-right: -4px;
		scrollbar-width: thin;
		overscroll-behavior: contain;
	}

	.store-mega-list--sources::-webkit-scrollbar {
		width: 4px;
	}

	.store-mega-list--sources::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.15);
		border-radius: 99px;
	}

	:global([prefers-color-scheme='dark']) .store-mega-list--sources::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
	}

	.store-mega-muted {
		display: block;
		font-family: var(--font-text);
		font-size: 12px;
		line-height: 16px;
		color: #6e6e73;
		letter-spacing: -0.01em;
		max-width: 240px;
	}

	:global([prefers-color-scheme='dark']) .store-mega-muted {
		color: #a1a1a6;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.menu-toggle {
		display: none;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-width: 44px;
		min-height: 44px;
		padding: 8px;
		border: none;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		border-radius: 8px;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.menu-toggle:hover {
		color: var(--fg);
		background: rgba(0, 0, 0, 0.04);
	}

	:global([prefers-color-scheme='dark']) .menu-toggle:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	.menu-toggle-text {
		max-width: 0;
		overflow: hidden;
		opacity: 0;
	}

	.menu-burger {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 18px;
		height: 18px;
		position: relative;
	}

	.menu-burger span {
		display: block;
		position: absolute;
		left: 0;
		right: 0;
		height: 1.5px;
		background: currentColor;
		border-radius: 1px;
		transition: transform 0.28s cubic-bezier(0.28, 0.11, 0.32, 1),
					opacity 0.2s ease;
	}

	.menu-burger span:first-child {
		top: 5px;
	}

	.menu-burger span:last-child {
		bottom: 5px;
	}

	.menu-burger--open span:first-child {
		top: 50%;
		transform: translateY(-50%) rotate(45deg);
	}

	.menu-burger--open span:last-child {
		bottom: auto;
		top: 50%;
		transform: translateY(-50%) rotate(-45deg);
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		min-width: 44px;
		min-height: 44px;
		padding: 8px;
		border: none;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		border-radius: 6px;
		transition:
			color 0.2s,
			background 0.2s;
	}

	.icon-btn:hover {
		color: var(--fg);
		background: rgba(0, 0, 0, 0.04);
	}

	:global([prefers-color-scheme='dark']) .icon-btn:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	.lang-label {
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.04em;
	}

	.nav-cta {
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--apple-blue);
		padding: 5px 0 5px 8px;
		margin-left: 2px;
		white-space: nowrap;
	}

	.nav-cta:hover {
		text-decoration: underline;
		opacity: 1;
	}

	.mobile-scrim {
		position: fixed;
		inset: 0;
		z-index: 9995;
		background: transparent;
		border: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.mobile-drawer {
		position: fixed;
		left: 0;
		right: 0;
		top: calc(var(--nav-height) + env(safe-area-inset-top, 0px));
		bottom: 0;
		z-index: 9996;
		background: #ffffff;
		animation: drawer-in 0.34s cubic-bezier(0.28, 0.11, 0.32, 1) forwards;
	}

	:global([prefers-color-scheme='dark']) .mobile-drawer {
		background: #1d1d1f;
	}

	@keyframes drawer-in {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mobile-drawer-scroll {
		height: 100%;
		overflow-y: auto;
		padding: 1.25rem max(1.25rem, env(safe-area-inset-left)) calc(2rem + env(safe-area-inset-bottom, 0px)) max(1.25rem, env(safe-area-inset-right));
		-webkit-overflow-scrolling: touch;
		overscroll-behavior-y: contain;
	}

	.mobile-home {
		display: flex;
		align-items: center;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--fg);
		min-height: 44px;
		margin-bottom: 0.5rem;
		letter-spacing: -0.03em;
	}

	.mobile-home.finans {
		margin-top: 0.25rem;
		font-size: 1.05rem;
		font-weight: 500;
	}

	.mobile-home.mobile-sources {
		margin-top: -0.5rem;
		margin-bottom: 1.5rem;
		font-size: 1.05rem;
		font-weight: 500;
		color: var(--apple-blue, #06c);
	}

	.mobile-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 1.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #fff;
		background: var(--apple-blue);
		border-radius: 980px;
		padding: 0 1.5rem;
		min-height: 44px;
		width: 100%;
		letter-spacing: -0.01em;
		transition: opacity 0.2s ease;
	}

	.mobile-cta:active {
		opacity: 0.72;
	}

	.mobile-section {
		margin-bottom: 1.5rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--apple-nav-border);
	}

	.mobile-cat-title {
		display: flex;
		align-items: center;
		min-height: 44px;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--fg);
		letter-spacing: -0.02em;
	}

	.mobile-section-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		margin: 0.75rem 0 0.5rem;
	}

	.mobile-source-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip {
		font-size: 0.8125rem;
		padding: 0.5rem 0.75rem;
		min-height: 36px;
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		background: color-mix(in srgb, var(--fg) 6%, transparent);
		color: var(--fg);
		border: 1px solid var(--apple-nav-border);
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}

	.chip:hover {
		background: color-mix(in srgb, var(--fg) 10%, transparent);
	}

	.chip.active {
		border-color: var(--apple-blue);
		color: var(--apple-blue);
		font-weight: 600;
		background: color-mix(in srgb, var(--apple-blue) 12%, transparent);
	}

	@media (max-width: 900px) {
		.desktop-nav {
			display: none;
		}

		.menu-toggle {
			display: inline-flex;
		}

		.menu-toggle-text {
			display: none;
		}

		.nav-cta {
			display: none;
		}
	}

	@media (max-width: 374px) {
		.lang-label {
			display: none;
		}
	}

	/* ——— Nav Weather Pill + Dropdown ——— */
	.nav-weather-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.nav-weather-pill {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 4px 8px;
		border: none;
		background: rgba(0, 0, 0, 0.04);
		border-radius: 980px;
		cursor: pointer;
		transition: background 0.25s cubic-bezier(0.25, 0.1, 0.25, 1),
					transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
		font-family: var(--font-text);
		color: var(--fg);
		line-height: 1;
	}

	:global([prefers-color-scheme='dark']) .nav-weather-pill {
		background: rgba(255, 255, 255, 0.08);
	}

	.nav-weather-pill:hover {
		background: rgba(0, 0, 0, 0.08);
		transform: scale(1.04);
	}

	:global([prefers-color-scheme='dark']) .nav-weather-pill:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	.nav-weather-pill:active {
		transform: scale(0.96);
	}

	.nav-weather-icon {
		font-size: 0.875rem;
		line-height: 1;
	}

	.nav-weather-temp {
		font-size: 0.6875rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}

	/* ——— Dropdown Container ——— */
	.nav-weather-dropdown {
		position: absolute;
		top: calc(100% + 10px);
		right: -20px;
		width: 340px;
		z-index: 10002;
		animation: nw-dropdown-in 0.38s cubic-bezier(0.32, 0.72, 0, 1) forwards;
		transform-origin: top right;
	}

	@keyframes nw-dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.94);
			filter: blur(4px);
		}
		40% {
			opacity: 1;
			filter: blur(0);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}

	.nw-dropdown-arrow {
		position: absolute;
		top: -5px;
		right: 32px;
		width: 10px;
		height: 10px;
		background: var(--apple-mega-panel-light, #fbfbfd);
		border-left: 1px solid var(--apple-mega-border-light, #d2d2d7);
		border-top: 1px solid var(--apple-mega-border-light, #d2d2d7);
		transform: rotate(45deg);
		z-index: 1;
		animation: nw-arrow-in 0.3s cubic-bezier(0.32, 0.72, 0, 1) 0.06s backwards;
	}

	@keyframes nw-arrow-in {
		from { opacity: 0; transform: rotate(45deg) scale(0.5); }
		to   { opacity: 1; transform: rotate(45deg) scale(1); }
	}

	:global([prefers-color-scheme='dark']) .nw-dropdown-arrow {
		background: var(--apple-mega-panel-dark, #161617);
		border-left-color: var(--apple-mega-border-dark);
		border-top-color: var(--apple-mega-border-dark);
	}

	/* ——— Card ——— */
	.nw-card {
		background: var(--apple-mega-panel-light, #fbfbfd);
		border: 1px solid var(--apple-mega-border-light, #d2d2d7);
		border-radius: 16px;
		padding: 16px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		gap: 12px;
		position: relative;
		z-index: 2;
		overflow: hidden;
	}

	:global([prefers-color-scheme='dark']) .nw-card {
		background: var(--apple-mega-panel-dark, #161617);
		border-color: var(--apple-mega-border-dark, rgba(255, 255, 255, 0.12));
		box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
	}

	/* ——— Staggered reveal animations (Apple-style cascade) ——— */
	.nw-stagger {
		animation: nw-stagger-reveal 0.4s cubic-bezier(0.32, 0.72, 0, 1) backwards;
	}
	.nw-stagger-1 { animation-delay: 0.04s; }
	.nw-stagger-2 { animation-delay: 0.08s; }
	.nw-stagger-3 { animation-delay: 0.14s; }
	.nw-stagger-4 { animation-delay: 0.20s; }

	@keyframes nw-stagger-reveal {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* City name text reveal */
	.nw-text-reveal {
		animation: nw-text-slide 0.35s cubic-bezier(0.32, 0.72, 0, 1) backwards;
	}

	@keyframes nw-text-slide {
		from {
			opacity: 0;
			transform: translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Icon pop-in (Apple bounce) */
	.nw-icon-pop {
		animation: nw-icon-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards;
	}

	@keyframes nw-icon-bounce {
		from {
			opacity: 0;
			transform: scale(0.3) rotate(-15deg);
		}
		to {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
	}

	/* Temperature counter-style reveal */
	.nw-temp-reveal {
		animation: nw-temp-count 0.45s cubic-bezier(0.32, 0.72, 0, 1) 0.12s backwards;
	}

	@keyframes nw-temp-count {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.85);
			filter: blur(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}

	/* Detail items stagger */
	.nw-detail-anim {
		animation: nw-detail-fade 0.35s cubic-bezier(0.32, 0.72, 0, 1) backwards;
	}

	@keyframes nw-detail-fade {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Forecast day stagger */
	.nw-fday-anim {
		animation: nw-fday-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}

	@keyframes nw-fday-pop {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.nw-stagger,
		.nw-text-reveal,
		.nw-icon-pop,
		.nw-temp-reveal,
		.nw-detail-anim,
		.nw-fday-anim {
			animation: none !important;
		}

		.nav-weather-dropdown {
			animation-duration: 0.15s !important;
		}
	}

	/* ——— City Selector ——— */
	.nw-city-selector {
		display: flex;
		gap: 3px;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.nw-city-selector::-webkit-scrollbar { display: none; }

	.nw-city-btn {
		font-family: var(--font-text);
		font-size: 0.625rem;
		font-weight: 500;
		padding: 3px 8px;
		border-radius: 980px;
		border: none;
		background: rgba(0, 0, 0, 0.04);
		color: var(--apple-eyebrow);
		cursor: pointer;
		transition: background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
					color 0.2s,
					transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
		white-space: nowrap;
	}

	:global([prefers-color-scheme='dark']) .nw-city-btn {
		background: rgba(255, 255, 255, 0.06);
	}

	.nw-city-btn:hover {
		background: rgba(0, 0, 0, 0.08);
		color: var(--fg);
		transform: scale(1.05);
	}

	:global([prefers-color-scheme='dark']) .nw-city-btn:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.nw-city-btn:active {
		transform: scale(0.95);
	}

	.nw-city-btn.active {
		background: var(--fg);
		color: var(--bg);
		font-weight: 600;
	}

	/* ——— Main weather display ——— */
	.nw-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nw-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.nw-city-name {
		font-family: var(--font-main);
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg);
		letter-spacing: -0.02em;
	}

	.nw-condition {
		font-size: 0.75rem;
		color: var(--apple-eyebrow);
	}

	.nw-right {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.nw-big-icon {
		font-size: 2.25rem;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
	}

	.nw-big-temp {
		font-family: var(--font-main);
		font-size: 2.75rem;
		font-weight: 200;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--fg);
		font-variant-numeric: tabular-nums;
	}

	/* ——— Detail bar ——— */
	.nw-details {
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.03);
		border-radius: 10px;
		padding: 8px 0;
	}

	:global([prefers-color-scheme='dark']) .nw-details {
		background: rgba(255, 255, 255, 0.04);
	}

	.nw-detail {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.nw-detail-label {
		font-size: 0.5625rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--apple-eyebrow);
		font-weight: 500;
	}

	.nw-detail-val {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--fg);
		font-variant-numeric: tabular-nums;
	}

	.nw-detail-val small {
		font-size: 0.5625rem;
		font-weight: 400;
		opacity: 0.6;
		margin-left: 1px;
	}

	.nw-detail-sep {
		width: 1px;
		height: 20px;
		background: rgba(0, 0, 0, 0.06);
	}

	:global([prefers-color-scheme='dark']) .nw-detail-sep {
		background: rgba(255, 255, 255, 0.08);
	}

	/* ——— Forecast strip ——— */
	.nw-forecast {
		display: flex;
		gap: 0;
		border-top: 1px solid rgba(0, 0, 0, 0.05);
		padding-top: 10px;
	}

	:global([prefers-color-scheme='dark']) .nw-forecast {
		border-top-color: rgba(255, 255, 255, 0.06);
	}

	.nw-fday {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.nw-fday-name {
		font-size: 0.5625rem;
		font-weight: 600;
		color: var(--apple-eyebrow);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.nw-fday-icon {
		font-size: 1.125rem;
		line-height: 1;
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.nw-fday:hover .nw-fday-icon {
		transform: scale(1.25);
	}

	.nw-fday-temps {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}

	.nw-fday-hi {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--fg);
	}

	.nw-fday-lo {
		font-size: 0.625rem;
		color: var(--apple-eyebrow);
	}

	/* ——— Responsive ——— */
	@media (max-width: 900px) {
		.nav-weather-wrap {
			order: -1;
		}

		.nav-weather-dropdown {
			right: -60px;
			width: min(320px, calc(100vw - 32px));
		}

		.nw-dropdown-arrow {
			right: 72px;
		}
	}

	@media (max-width: 374px) {
		.nav-weather-dropdown {
			right: -80px;
			width: min(290px, calc(100vw - 16px));
		}

		.nw-dropdown-arrow {
			right: 92px;
		}
	}
</style>
