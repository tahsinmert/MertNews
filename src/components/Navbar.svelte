<script>
	import { page } from '$app/stores';
	import { locale, t } from '$lib/i18n';
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import SearchOverlay from './SearchOverlay.svelte';

	/**
	 * @type {Array<{
	 *   path: string;
	 *   labelKey: string;
	 *   internal: string;
	 *   sources: Array<{ name: string; slug: string }>;
	 * }>}
	 */
	export let feedNav = [];

	let isSearchOpen = false;
	let mobileMenuOpen = false;

	$: pathname = $page.url.pathname;
	$: activeSlugs = $page.url.searchParams.getAll('kaynak');
	$: kaynakSlug = /^\/kaynak\/([^/]+)$/.exec(pathname)?.[1] ?? null;

	function toggleSearch() {
		isSearchOpen = !isSearchOpen;
		if (typeof document !== 'undefined') {
			if (isSearchOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		openMega = null;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			if (openMega) {
				openMega = null;
				return;
			}
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

	/**
	 * @param {string} slug
	 */
	function sourcePageHref(slug) {
		return `/kaynak/${slug}`;
	}

	/**
	 * @param {string} slug
	 */
	function isSourceActive(slug) {
		return kaynakSlug === slug || activeSlugs.includes(slug);
	}

	/**
	 * @param {{ path: string; sources?: Array<{ slug: string }> }} col
	 */
	function isCategoryNavActive(col) {
		if (pathname === col.path) return true;
		if (!kaynakSlug || !col.sources?.length) return false;
		return col.sources.some((s) => s.slug === kaynakSlug);
	}

	/**
	 * @param {{ sources?: Array<{ slug: string }> }} col
	 */
	function isViewingSourceInColumn(col) {
		return !!(kaynakSlug && col.sources?.some((s) => s.slug === kaynakSlug));
	}

	/**
	 * Mega paneller fixed + tam genişlikte; .desktop-nav içindeki overflow/mask bunları kesiyordu.
	 * Paneller nav dışı katmanda, açık state fare ile (köprü + gecikme).
	 */
	/** @type {string | null} */
	let openMega = null;
	let megaCloseTimer = 0;

	/** @param {string} id */
	function megaEnter(id) {
		if (typeof window !== 'undefined') {
			window.clearTimeout(megaCloseTimer);
		}
		openMega = id;
	}

	function megaLeave() {
		if (typeof window === 'undefined') return;
		megaCloseTimer = window.setTimeout(() => {
			openMega = null;
		}, 200);
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.clearTimeout(megaCloseTimer);
		}
	});

	onMount(() => {
		if (typeof document !== 'undefined') {
			const cookies = document.cookie.split('; ');
			const localeCookie = cookies.find((c) => c.startsWith('locale='));
			if (localeCookie) {
				locale.set(localeCookie.split('=')[1]);
			}
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- apple.com.tr tarzı: tam genişlik mega menü + köprü alanı -->
<div class="nav-shell">
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
					<span class="menu-burger" aria-hidden="true">
						<span></span>
						<span></span>
						<span></span>
					</span>
				</button>

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
</div>

<SearchOverlay isOpen={isSearchOpen} close={toggleSearch} />

<style>
	.nav-shell :global(a:hover),
	.nav-shell :global(button:hover) {
		opacity: 1;
	}

	.nav-shell {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9998;
		height: var(--nav-height);
		overflow: visible;
		/* apple.com globalnav – hafif cam */
		background: rgba(251, 251, 253, 0.82);
		backdrop-filter: saturate(180%) blur(20px);
		-webkit-backdrop-filter: saturate(180%) blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
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
		top: var(--nav-height);
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
		top: var(--nav-height);
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
		top: var(--nav-height);
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
		gap: 0.35rem;
		padding: 6px 8px;
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
		gap: 4px;
		width: 18px;
	}

	.menu-burger span {
		display: block;
		height: 2px;
		background: currentColor;
		border-radius: 1px;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 8px;
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
		top: var(--nav-height);
		z-index: 9995;
		background: rgba(0, 0, 0, 0.28);
		border: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.mobile-drawer {
		position: fixed;
		left: 0;
		right: 0;
		top: var(--nav-height);
		bottom: 0;
		z-index: 9996;
		background: var(--bg);
		border-bottom: 1px solid var(--apple-nav-border);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
		animation: drawer-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}

	@keyframes drawer-in {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mobile-drawer-scroll {
		height: 100%;
		overflow-y: auto;
		padding: 1rem 1.25rem 2.5rem;
		-webkit-overflow-scrolling: touch;
	}

	.mobile-home {
		display: block;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--fg);
		margin-bottom: 1.25rem;
		letter-spacing: -0.03em;
	}

	.mobile-home.finans {
		margin-top: 0.5rem;
		font-size: 1.05rem;
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
		margin-top: 1.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--apple-blue);
	}

	.mobile-section {
		margin-bottom: 1.5rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--apple-nav-border);
	}

	.mobile-cat-title {
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
		font-size: 0.78rem;
		padding: 0.4rem 0.65rem;
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
	}
</style>
