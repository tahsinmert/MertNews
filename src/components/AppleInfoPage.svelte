<script>
	import { t } from '$lib/i18n';

	/** @type {string} */
	export let icon = 'info';
	/** @type {string} */
	export let titleKey;
	/** @type {string | undefined} */
	export let subtitleKey = undefined;
	/** @type {string} */
	export let updatedKey = 'page.common.updated';
	/** @type {boolean} */
	export let showBreadcrumb = true;
	/**
	 * @type {Array<{ id: string, labelKey: string }>}
	 */
	export let tocItems = [];
	/**
	 * @type {Array<{
	 *   id?: string,
	 *   titleKey: string,
	 *   span?: 'full',
	 *   variant?: 'default' | 'callout' | 'subtle',
	 *   bodyKeys?: string[],
	 *   bodyKey?: string,
	 *   bodyHtmlKey?: string,
	 *   bullets?: string[],
	 *   steps?: { titleKey: string, bodyKey: string }[],
	 *   pairs?: { labelKey: string, valueKey: string }[],
	 *   calloutKey?: string,
	 *   items?: Array<{ href: string, labelKey: string } | string>
	 * }>}
	 */
	export let sections = [];
</script>

<main class="page-main">
	<div class="container page-inner">
		{#if showBreadcrumb}
			<nav class="breadcrumb" aria-label="Breadcrumb">
				<a href="/" class="crumb">{$t('page.common.breadcrumbHome')}</a>
				<span class="crumb-sep" aria-hidden="true">/</span>
				<span class="crumb current" aria-current="page">{$t(titleKey)}</span>
			</nav>
		{/if}

		<header class="hero apple-glass" aria-label="Page header">
			<div class="hero-glow" aria-hidden="true"></div>
			<div class="hero-inner">
				<div class="hero-icon" aria-hidden="true">
					{#if icon === 'help'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M16 16.5c0-1.1-1-1.8-2-2.1-1.3-.4-3-.9-3-2.8 0-1.8 1.5-3.1 3.5-3.1 1.7 0 3 1 3 2.5"></path>
							<path d="M12 19h.01"></path>
						</svg>
					{:else if icon === 'contact'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M4 6h16"></path>
							<path d="M4 6l8 7 8-7"></path>
							<path d="M4 6v12h16V6"></path>
						</svg>
					{:else if icon === 'about'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M4 19a2 2 0 0 0 2 2h14"></path>
							<path d="M6 2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
							<path d="M9 7h6"></path>
							<path d="M9 11h6"></path>
							<path d="M9 15h4"></path>
						</svg>
					{:else if icon === 'ads'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 11l8-8 8 8-8 8-8-8z"></path>
							<path d="M13 3l4 4"></path>
							<path d="M6 18l-2 2"></path>
						</svg>
					{:else if icon === 'careers'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
							<rect x="3" y="6" width="18" height="16" rx="2"></rect>
							<path d="M3 13h18"></path>
						</svg>
					{:else if icon === 'profile'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 21a8 8 0 0 0-16 0"></path>
							<circle cx="12" cy="7" r="4"></circle>
						</svg>
					{:else if icon === 'settings'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"></path>
							<path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2 2 0 0 1-1.4 3.4h-.2a1.8 1.8 0 0 0-1.9 1.2 2 2 0 0 1-3.8 0 1.8 1.8 0 0 0-1.9-1.2h-.2a2 2 0 0 1-1.4-3.4l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.1H4.6a2 2 0 0 1 0-4h.2A1.8 1.8 0 0 0 6.4 8a1.8 1.8 0 0 0-.4-2l-.1-.1A2 2 0 0 1 7.3 2.5h.2a1.8 1.8 0 0 0 1.9-1.2 2 2 0 0 1 3.8 0 1.8 1.8 0 0 0 1.9 1.2h.2a2 2 0 0 1 1.4 3.4l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1h.2a2 2 0 0 1 0 4h-.2a1.8 1.8 0 0 0-1.6 1.1z"></path>
						</svg>
					{:else if icon === 'lock'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<rect x="4" y="11" width="16" height="10" rx="2"></rect>
							<path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
						</svg>
					{:else if icon === 'cookie'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 1 12 2z"></path>
							<circle cx="8.5" cy="10" r="1"></circle>
							<circle cx="12.2" cy="14.2" r="1"></circle>
							<circle cx="15.6" cy="8.7" r="1"></circle>
						</svg>
					{:else if icon === 'terms'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
							<polyline points="14 2 14 8 20 8"></polyline>
							<path d="M8 13h8"></path>
							<path d="M8 17h6"></path>
						</svg>
					{:else if icon === 'sitemap'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="8" height="8" rx="1"></rect>
							<rect x="13" y="3" width="8" height="8" rx="1"></rect>
							<rect x="3" y="13" width="8" height="8" rx="1"></rect>
							<rect x="13" y="13" width="8" height="8" rx="1"></rect>
						</svg>
					{:else}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M16 12h-4V7"></path>
						</svg>
					{/if}
				</div>

				<div class="hero-text">
					<h1 class="hero-title">{$t(titleKey)}</h1>
					{#if subtitleKey}
						<p class="hero-subtitle">{$t(subtitleKey)}</p>
					{/if}
					<p class="hero-meta">{$t(updatedKey)}</p>
				</div>
			</div>
		</header>

		{#if tocItems.length > 0}
			<div class="toc-wrap">
				<p class="toc-label">{$t('page.toc.onThisPage')}</p>
				<nav class="toc touch-scroll" aria-label={$t('page.toc.onThisPage')}>
					{#each tocItems as item}
						<a class="toc-pill" href="#{item.id}">{$t(item.labelKey)}</a>
					{/each}
				</nav>
			</div>
		{/if}

		<div class="grid">
			{#each sections as section}
				<section
					class="info-section"
					class:full={section.span === 'full'}
					class:callout={section.variant === 'callout'}
					class:subtle={section.variant === 'subtle'}
					id={section.id || undefined}
				>
					<h2 class="section-title">{$t(section.titleKey)}</h2>
					{#if section.bodyKeys}
						{#each section.bodyKeys as bk}
							<p class="section-body">{$t(bk)}</p>
						{/each}
					{/if}
					{#if section.bodyKey}
						<p class="section-body">{$t(section.bodyKey)}</p>
					{/if}
					{#if section.bodyHtmlKey}
						<div class="section-body">{@html $t(section.bodyHtmlKey)}</div>
					{/if}
					{#if section.calloutKey}
						<p class="callout-box">{$t(section.calloutKey)}</p>
					{/if}
					{#if section.pairs}
						<dl class="def-list">
							{#each section.pairs as pair}
								<div class="def-row">
									<dt>{$t(pair.labelKey)}</dt>
									<dd>{$t(pair.valueKey)}</dd>
								</div>
							{/each}
						</dl>
					{/if}
					{#if section.steps}
						<ol class="step-list">
							{#each section.steps as step, i}
								<li>
									<span class="step-num">{i + 1}</span>
									<div class="step-body">
										<strong>{$t(step.titleKey)}</strong>
										<p>{$t(step.bodyKey)}</p>
									</div>
								</li>
							{/each}
						</ol>
					{/if}
					{#if section.bullets}
						<ul class="section-list">
							{#each section.bullets as bulletKey}
								<li>{$t(bulletKey)}</li>
							{/each}
						</ul>
					{/if}
					{#if section.items}
						<ul class="section-list">
							{#each section.items as item}
								<li>
									{#if typeof item === 'string'}
										{$t(item)}
									{:else}
										<a class="inline-link" href={item.href}>{$t(item.labelKey)}</a>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/each}
		</div>

		<slot />
	</div>
</main>

<style>
	.page-main {
		min-height: 100vh;
		padding-top: calc(var(--nav-height) + 12px);
		padding-bottom: 2rem;
	}

	.page-inner {
		padding-bottom: 2rem;
	}

	.breadcrumb {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.5rem;
		font-size: 0.8rem;
		color: var(--muted);
		margin-top: 12px;
		margin-bottom: 14px;
	}

	.crumb {
		color: var(--muted);
		transition: color 0.2s;
	}

	a.crumb:hover {
		color: var(--accent);
		opacity: 1;
	}

	.crumb.current {
		color: var(--fg);
		font-weight: 500;
	}

	.crumb-sep {
		opacity: 0.45;
		user-select: none;
	}

	.hero {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--glass-border);
		border-radius: 20px;
		padding: 28px 26px;
		margin-top: 4px;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.38));
	}

	:global([prefers-color-scheme='dark']) .hero {
		background: linear-gradient(145deg, rgba(29, 29, 31, 0.85), rgba(29, 29, 31, 0.5));
	}

	.hero-glow {
		position: absolute;
		inset: -40% -20% auto -20%;
		height: 80%;
		background: radial-gradient(ellipse at 50% 0%, rgba(0, 102, 204, 0.2), transparent 55%);
		pointer-events: none;
	}

	:global([prefers-color-scheme='dark']) .hero-glow {
		background: radial-gradient(ellipse at 50% 0%, rgba(10, 132, 255, 0.28), transparent 55%);
	}

	.hero-inner {
		position: relative;
		display: flex;
		gap: 18px;
		align-items: flex-start;
		z-index: 1;
	}

	.hero-icon {
		width: 48px;
		height: 48px;
		border-radius: 16px;
		display: grid;
		place-items: center;
		background: radial-gradient(120% 120% at 10% 0%, rgba(0, 102, 204, 0.2), transparent 60%);
		color: var(--accent);
		flex: 0 0 auto;
		border: 1px solid rgba(0, 102, 204, 0.2);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
	}

	:global([prefers-color-scheme='dark']) .hero-icon {
		background: radial-gradient(120% 120% at 10% 0%, rgba(10, 132, 255, 0.28), transparent 60%);
		border-color: rgba(10, 132, 255, 0.28);
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
	}

	.hero-text {
		min-width: 0;
	}

	.hero-title {
		font-size: clamp(2rem, 4.8vw, 3.35rem);
		font-weight: 700;
		letter-spacing: -0.045em;
		margin: 0;
		line-height: 1.05;
		color: var(--fg);
	}

	.hero-subtitle {
		margin-top: 12px;
		font-size: 1.08rem;
		color: var(--muted);
		line-height: 1.65;
		max-width: 62ch;
	}

	.hero-meta {
		margin-top: 14px;
		font-size: 0.78rem;
		color: var(--muted);
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.toc-wrap {
		margin-top: 20px;
	}

	.toc-label {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
		margin-bottom: 10px;
	}

	.toc {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 6px;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		scroll-snap-type: x proximity;
	}

	.toc::-webkit-scrollbar {
		display: none;
	}

	.toc-pill {
		flex: 0 0 auto;
		scroll-snap-align: start;
		padding: 10px 16px;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		border-radius: 980px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--fg);
		background: rgba(0, 0, 0, 0.04);
		border: 1px solid var(--card-border);
		transition:
			background 0.2s,
			transform 0.2s;
	}

	:global([prefers-color-scheme='dark']) .toc-pill {
		background: rgba(255, 255, 255, 0.06);
	}

	.toc-pill:hover {
		background: rgba(0, 102, 204, 0.1);
		border-color: rgba(0, 102, 204, 0.25);
		transform: translateY(-1px);
		opacity: 1;
	}

	:global([prefers-color-scheme='dark']) .toc-pill:hover {
		background: rgba(10, 132, 255, 0.15);
	}

	.grid {
		margin-top: 22px;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 16px;
	}

	.info-section {
		grid-column: span 12;
		border-radius: 18px;
		border: 1px solid var(--card-border);
		background: rgba(255, 255, 255, 0.58);
		padding: 22px 22px;
		scroll-margin-top: 100px;
	}

	.info-section.full {
		grid-column: 1 / -1;
	}

	.info-section.subtle {
		background: rgba(0, 0, 0, 0.02);
	}

	:global([prefers-color-scheme='dark']) .info-section {
		background: rgba(29, 29, 31, 0.42);
	}

	:global([prefers-color-scheme='dark']) .info-section.subtle {
		background: rgba(255, 255, 255, 0.04);
	}

	.info-section.callout {
		border-left: 4px solid var(--accent);
		background: linear-gradient(90deg, rgba(0, 102, 204, 0.08), transparent 55%);
	}

	:global([prefers-color-scheme='dark']) .info-section.callout {
		background: linear-gradient(90deg, rgba(10, 132, 255, 0.12), transparent 55%);
	}

	.section-title {
		font-size: 1.12rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--fg);
		margin-bottom: 12px;
	}

	.section-body {
		color: var(--muted);
		line-height: 1.75;
		margin-bottom: 12px;
		font-size: 0.95rem;
	}

	.section-body:last-child {
		margin-bottom: 0;
	}

	.callout-box {
		margin-top: 4px;
		padding: 14px 16px;
		border-radius: 12px;
		background: rgba(0, 102, 204, 0.09);
		border: 1px solid rgba(0, 102, 204, 0.18);
		color: var(--fg);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	:global([prefers-color-scheme='dark']) .callout-box {
		background: rgba(10, 132, 255, 0.12);
		border-color: rgba(10, 132, 255, 0.22);
	}

	.def-list {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.def-row {
		display: grid;
		grid-template-columns: minmax(0, 140px) 1fr;
		gap: 12px 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--card-border);
	}

	.def-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.def-row dt {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--muted);
	}

	.def-row dd {
		font-size: 0.93rem;
		color: var(--fg);
		line-height: 1.55;
		margin: 0;
	}

	.step-list {
		list-style: none;
		padding: 0;
		margin: 8px 0 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.step-list li {
		display: flex;
		gap: 14px;
		align-items: flex-start;
	}

	.step-num {
		flex: 0 0 32px;
		height: 32px;
		border-radius: 10px;
		display: grid;
		place-items: center;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--accent);
		background: rgba(0, 102, 204, 0.12);
	}

	:global([prefers-color-scheme='dark']) .step-num {
		background: rgba(10, 132, 255, 0.18);
	}

	.step-body strong {
		display: block;
		font-size: 0.95rem;
		color: var(--fg);
		margin-bottom: 4px;
	}

	.step-body p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.65;
	}

	.section-list {
		margin-top: 6px;
		padding-left: 1.15rem;
		color: var(--muted);
		line-height: 1.85;
		font-size: 0.93rem;
	}

	.inline-link {
		color: var(--accent);
		font-weight: 500;
		transition: opacity 0.2s;
	}

	.inline-link:hover {
		opacity: 0.85;
	}

	@media (min-width: 960px) {
		.info-section:not(.full) {
			grid-column: span 6;
		}
	}

	@media (max-width: 640px) {
		.def-row {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 520px) {
		.hero {
			padding: 22px 18px;
			border-radius: 16px;
		}
		.hero-inner {
			flex-direction: column;
		}
	}
</style>
