<script>
	import { t } from '$lib/i18n';

	/** @type {string} */
	export let titleKey;
	/** @type {string | undefined} */
	export let subtitleKey = undefined;
	/** @type {string} */
	export let updatedKey = 'page.common.updated';
	/** @type {boolean} */
	export let showBreadcrumb = true;
	/** @type {Array<{ id: string, labelKey: string }>} */
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

<main class="pg">
	<div class="pg-header">
		<div class="pg-header-inner container">
			{#if showBreadcrumb}
				<nav class="breadcrumb" aria-label="Breadcrumb">
					<a href="/">{$t('page.common.breadcrumbHome')}</a>
					<span aria-hidden="true">›</span>
					<span aria-current="page">{$t(titleKey)}</span>
				</nav>
			{/if}
			<h1 class="pg-title">{$t(titleKey)}</h1>
			{#if subtitleKey}
				<p class="pg-subtitle">{$t(subtitleKey)}</p>
			{/if}
			<p class="pg-meta">{$t(updatedKey)}</p>
		</div>
	</div>

	<div class="pg-body container">
		{#if tocItems.length > 0}
			<nav class="toc" aria-label={$t('page.toc.onThisPage')}>
				{#each tocItems as item}
					<a class="toc-link" href="#{item.id}">{$t(item.labelKey)}</a>
				{/each}
			</nav>
		{/if}

		{#each sections as section, i}
			<section
				class="sec"
				class:sec--callout={section.variant === 'callout'}
				id={section.id || undefined}
			>
				<h2 class="sec-title">{$t(section.titleKey)}</h2>

				{#if section.bodyKeys}
					{#each section.bodyKeys as bk}
						<p class="sec-body">{$t(bk)}</p>
					{/each}
				{/if}
				{#if section.bodyKey}
					<p class="sec-body">{$t(section.bodyKey)}</p>
				{/if}
				{#if section.bodyHtmlKey}
					<div class="sec-body">{@html $t(section.bodyHtmlKey)}</div>
				{/if}

				{#if section.calloutKey}
					<aside class="callout">{$t(section.calloutKey)}</aside>
				{/if}

				{#if section.pairs}
					<dl class="pairs">
						{#each section.pairs as pair}
							<div class="pair-row">
								<dt>{$t(pair.labelKey)}</dt>
								<dd>{$t(pair.valueKey)}</dd>
							</div>
						{/each}
					</dl>
				{/if}

				{#if section.steps}
					<ol class="steps">
						{#each section.steps as step, si}
							<li>
								<span class="step-n">{si + 1}</span>
								<div>
									<strong>{$t(step.titleKey)}</strong>
									<p>{$t(step.bodyKey)}</p>
								</div>
							</li>
						{/each}
					</ol>
				{/if}

				{#if section.bullets}
					<ul class="list">
						{#each section.bullets as bk}
							<li>{$t(bk)}</li>
						{/each}
					</ul>
				{/if}

				{#if section.items}
					<ul class="list list--links">
						{#each section.items as item}
							<li>
								{#if typeof item === 'string'}
									{$t(item)}
								{:else}
									<a href={item.href}>{$t(item.labelKey)}</a>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/each}

		<slot />
	</div>
</main>

<style>
	.pg {
		min-height: 100vh;
		padding-top: var(--nav-height);
	}

	.pg-header {
		padding: 4rem 0 2.5rem;
		border-bottom: 1px solid var(--card-border);
	}

	.pg-header-inner {
		max-width: 820px;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8125rem;
		color: var(--muted);
		margin-bottom: 1.25rem;
	}

	.breadcrumb a {
		color: var(--muted);
	}

	.breadcrumb a:hover {
		color: var(--apple-blue);
	}

	.breadcrumb span[aria-hidden] {
		opacity: 0.4;
		font-size: 0.75rem;
	}

	.breadcrumb span[aria-current] {
		color: var(--fg);
		font-weight: 500;
	}

	.pg-title {
		font-size: clamp(2.25rem, 5.5vw, 3.5rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.06;
		color: var(--fg);
		margin: 0;
	}

	.pg-subtitle {
		margin-top: 1rem;
		font-size: 1.125rem;
		line-height: 1.5;
		color: var(--muted);
		max-width: 56ch;
	}

	.pg-meta {
		margin-top: 1.25rem;
		font-size: 0.75rem;
		color: var(--muted);
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.pg-body {
		max-width: 820px;
		padding-top: 2rem;
		padding-bottom: 4rem;
	}

	.toc {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--card-border);
		margin-bottom: 0;
	}

	.toc-link {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--apple-blue);
		padding: 0.375rem 0.75rem;
		border-radius: 980px;
		border: 1px solid var(--card-border);
		transition: background 0.15s ease;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}

	.toc-link:hover {
		background: color-mix(in srgb, var(--apple-blue) 8%, transparent);
	}

	.sec {
		padding: 2rem 0;
		border-bottom: 1px solid var(--card-border);
		scroll-margin-top: calc(var(--nav-height) + 1.5rem);
	}

	.sec:last-of-type {
		border-bottom: none;
	}

	.sec--callout {
		padding-left: 1.25rem;
		border-left: 3px solid var(--apple-blue);
	}

	.sec-title {
		font-size: 1.375rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--fg);
		margin: 0 0 0.75rem;
		line-height: 1.2;
	}

	.sec-body {
		font-size: 1rem;
		line-height: 1.7;
		color: var(--muted);
		margin: 0 0 0.75rem;
	}

	.sec-body:last-child {
		margin-bottom: 0;
	}

	.callout {
		margin-top: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 10px;
		background: color-mix(in srgb, var(--apple-blue) 6%, transparent);
		color: var(--fg);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.pairs {
		margin-top: 0.75rem;
	}

	.pair-row {
		display: flex;
		gap: 1.5rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--card-border);
	}

	.pair-row:last-child {
		border-bottom: none;
	}

	.pair-row dt {
		flex: 0 0 120px;
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.pair-row dd {
		font-size: 0.9375rem;
		color: var(--fg);
		line-height: 1.5;
		margin: 0;
	}

	.steps {
		list-style: none;
		padding: 0;
		margin: 0.75rem 0 0;
		counter-reset: none;
	}

	.steps li {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		padding: 0.75rem 0;
	}

	.steps li + li {
		border-top: 1px solid var(--card-border);
	}

	.step-n {
		flex: 0 0 28px;
		height: 28px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--apple-blue);
		background: color-mix(in srgb, var(--apple-blue) 10%, transparent);
		margin-top: 2px;
	}

	.steps strong {
		display: block;
		font-size: 0.9375rem;
		color: var(--fg);
		margin-bottom: 0.25rem;
	}

	.steps p {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--muted);
		line-height: 1.6;
	}

	.list {
		margin: 0.75rem 0 0;
		padding-left: 1.25rem;
		color: var(--muted);
		line-height: 1.8;
		font-size: 0.9375rem;
	}

	.list--links a {
		color: var(--apple-blue);
		font-weight: 500;
	}

	.list--links a:hover {
		text-decoration: underline;
	}

	@media (max-width: 734px) {
		.pg-header {
			padding: 3rem 0 2rem;
		}

		.sec--callout {
			padding-left: 1rem;
		}

		.pair-row {
			flex-direction: column;
			gap: 0.25rem;
		}

		.pair-row dt {
			flex: none;
		}
	}
</style>
