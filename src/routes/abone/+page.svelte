<script>
	import { t } from '$lib/i18n';

	let email = '';
	let status = 'idle';
	let message = '';

	let selectedCategories = {
		world: true,
		turkey: true,
		technology: false,
		economy: false,
		finance: false,
		sports: false
	};
	let frequency = 'daily';

	async function handleSubmit(event) {
		event.preventDefault();
		status = 'loading';
		message = '';

		const activeCategories = Object.keys(selectedCategories).filter(k => selectedCategories[k]);

		if (activeCategories.length === 0) {
			status = 'error';
			message = $t('subscribe.errorNoCategory');
			return;
		}

		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, categories: activeCategories, frequency })
			});
			const data = await res.json();
			if (res.ok) {
				status = 'success';
				message = data.message;
				email = '';
			} else {
				status = 'error';
				message = data.message;
			}
		} catch {
			status = 'error';
			message = $t('subscribe.errorNetwork');
		}
	}
</script>

<svelte:head>
	<title>{$t('nav.subscribe')} - MertNews</title>
</svelte:head>

<main class="pg">
	<div class="pg-header">
		<div class="pg-header-inner container">
			<h1 class="pg-title">{$t('subscribe.title')}</h1>
			<p class="pg-subtitle">{$t('subscribe.subtitle')}</p>
		</div>
	</div>

	<div class="pg-body container">
		{#if status === 'success'}
			<div class="done">
				<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--apple-green,#34c759)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
				<h2>{$t('subscribe.successTitle')}</h2>
				<p>{message}</p>
				<button type="button" class="link-btn" on:click={() => status = 'idle'}>{$t('subscribe.btnReset')}</button>
			</div>
		{:else}
			<form class="sub-form" on:submit={handleSubmit}>
				<div class="field">
					<label for="email">{$t('subscribe.emailPlaceholder')}</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						placeholder="name@example.com"
						required
						disabled={status === 'loading'}
					/>
				</div>

				<fieldset class="field">
					<legend>{$t('subscribe.categoriesTitle')}</legend>
					<div class="chips">
						{#each [
							['world', $t('nav.world')],
							['turkey', $t('nav.turkey')],
							['technology', $t('nav.technology')],
							['economy', $t('nav.economy')],
							['finance', $t('nav.finance')],
							['sports', $t('nav.sports')]
						] as [key, label]}
							<label class="chip" class:on={selectedCategories[key]}>
								<input type="checkbox" bind:checked={selectedCategories[key]} disabled={status === 'loading'} />
								{label}
							</label>
						{/each}
					</div>
				</fieldset>

				<fieldset class="field">
					<legend>{$t('subscribe.frequencyTitle')}</legend>
					<div class="seg">
						<label class="seg-opt" class:active={frequency === 'daily'}>
							<input type="radio" value="daily" bind:group={frequency} disabled={status === 'loading'} />
							{$t('subscribe.freqDaily')}
						</label>
						<label class="seg-opt" class:active={frequency === 'weekly'}>
							<input type="radio" value="weekly" bind:group={frequency} disabled={status === 'loading'} />
							{$t('subscribe.freqWeekly')}
						</label>
					</div>
				</fieldset>

				{#if status === 'error'}
					<p class="err">{message}</p>
				{/if}

				<button type="submit" class="submit-btn" disabled={status === 'loading'}>
					{#if status === 'loading'}
						<span class="spinner" aria-hidden="true"></span>
					{/if}
					{status === 'loading' ? $t('subscribe.btnLoading') : $t('subscribe.btnSubmit')}
				</button>

				<p class="terms">
					{@html $t('subscribe.terms').replace('{privacy}', `<a href="/gizlilik">${$t('subscribe.privacyLink')}</a>`)}
				</p>
			</form>
		{/if}
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
		text-align: center;
	}

	.pg-header-inner {
		max-width: 600px;
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
	}

	.pg-body {
		max-width: 480px;
		padding-top: 2.5rem;
		padding-bottom: 4rem;
	}

	.sub-form {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.field {
		border: none;
		padding: 0;
		margin: 0;
	}

	.field label,
	.field legend {
		display: block;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--fg);
		margin-bottom: 0.5rem;
		padding: 0;
	}

	.field input[type='email'] {
		width: 100%;
		padding: 0.875rem 1rem;
		font-size: 1rem;
		font-family: inherit;
		background: var(--apple-gray-100, #f5f5f7);
		border: 1.5px solid transparent;
		border-radius: 10px;
		color: var(--fg);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	:global([prefers-color-scheme='dark']) .field input[type='email'] {
		background: rgba(255, 255, 255, 0.06);
	}

	.field input[type='email']:focus {
		outline: none;
		border-color: var(--apple-blue);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--apple-blue) 18%, transparent);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 0.875rem;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		border-radius: 980px;
		border: 1px solid var(--card-border);
		color: var(--muted);
		background: transparent;
		transition: all 0.15s ease;
		user-select: none;
	}

	.chip input { display: none; }

	.chip.on {
		border-color: var(--apple-blue);
		color: var(--apple-blue);
		background: color-mix(in srgb, var(--apple-blue) 8%, transparent);
	}

	.seg {
		display: flex;
		background: var(--apple-gray-100, #f5f5f7);
		border-radius: 10px;
		padding: 3px;
	}

	:global([prefers-color-scheme='dark']) .seg {
		background: rgba(255, 255, 255, 0.06);
	}

	.seg-opt {
		flex: 1;
		text-align: center;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--muted);
		font-size: 0.9375rem;
		font-weight: 500;
		border-radius: 8px;
		transition: color 0.15s, background 0.15s, box-shadow 0.15s;
	}

	.seg-opt input { display: none; }

	.seg-opt.active {
		color: var(--fg);
		background: var(--bg, #fff);
		box-shadow: 0 1px 4px rgba(0,0,0,0.08);
	}

	.err {
		color: var(--apple-red, #ff3b30);
		font-size: 0.875rem;
		text-align: center;
		padding: 0.625rem 1rem;
		border-radius: 8px;
		background: color-mix(in srgb, var(--apple-red, #ff3b30) 8%, transparent);
		margin: 0;
	}

	.submit-btn {
		width: 100%;
		min-height: 50px;
		padding: 0 1.5rem;
		font-size: 1.0625rem;
		font-weight: 500;
		font-family: inherit;
		color: #fff;
		background: var(--apple-blue);
		border: none;
		border-radius: 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: opacity 0.15s ease;
	}

	.submit-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.submit-btn:not(:disabled):active {
		opacity: 0.78;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.terms {
		font-size: 0.75rem;
		text-align: center;
		color: var(--muted);
		line-height: 1.55;
		margin: 0;
	}

	.terms :global(a) {
		color: var(--apple-blue);
		text-decoration: underline;
	}

	.done {
		text-align: center;
		padding: 2rem 0 4rem;
	}

	.done h2 {
		margin-top: 1.25rem;
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--fg);
	}

	.done p {
		margin-top: 0.5rem;
		color: var(--muted);
		line-height: 1.5;
	}

	.link-btn {
		margin-top: 1.5rem;
		background: none;
		border: none;
		color: var(--apple-blue);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		padding: 0;
	}

	.link-btn:hover {
		text-decoration: underline;
	}

	@media (max-width: 734px) {
		.pg-header {
			padding: 3rem 0 2rem;
		}

		.pg-body {
			padding-top: 2rem;
		}
	}
</style>
