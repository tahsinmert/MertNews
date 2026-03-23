<script>
	import { fade, fly } from 'svelte/transition';
	import { t } from '$lib/i18n';

	let email = '';
	let status = 'idle'; // idle | loading | success | error
	let message = '';

	// Preferences state
	let selectedCategories = {
		world: true,
		turkey: true,
		technology: false,
		economy: false,
		finance: false,
		sports: false
	};
	let frequency = 'daily'; // daily | weekly

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
				body: JSON.stringify({ 
					email, 
					categories: activeCategories,
					frequency 
				})
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
		} catch (error) {
			status = 'error';
			message = $t('subscribe.errorNetwork');
		}
	}
</script>

<svelte:head>
	<title>{$t('nav.subscribe')} - MertNews</title>
</svelte:head>

<div class="subscribe-page" in:fade={{ duration: 600 }}>
	<div class="container wrapper">
		
		<div class="content-box">
			<div class="header-section" in:fly={{ y: 20, duration: 800, delay: 100 }}>
				<div class="icon-wrapper">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
						<polyline points="22,6 12,13 2,6"></polyline>
					</svg>
				</div>
				<h1 class="title">{$t('subscribe.title')}</h1>
				<p class="subtitle">{$t('subscribe.subtitle')}</p>
			</div>

			<form class="subscribe-form" on:submit={handleSubmit} in:fly={{ y: 20, duration: 800, delay: 200 }}>
				
				{#if status === 'success'}
					<div class="success-card" in:fade={{ duration: 300 }}>
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--apple-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						<h3>{$t('subscribe.successTitle')}</h3>
						<p>{message}</p>
						<button type="button" class="btn-secondary mt-3" on:click={() => status = 'idle'}>{$t('subscribe.btnReset')}</button>
					</div>
				{:else}
					<div class="input-group">
						<label for="email" class="sr-only">E-posta Adresi</label>
						<input 
							type="email" 
							id="email" 
							bind:value={email} 
							placeholder={$t('subscribe.emailPlaceholder')}
							required
							disabled={status === 'loading'}
						/>
					</div>

					<div class="preferences-group">
						<h3 class="group-title">{$t('subscribe.categoriesTitle')}</h3>
						<div class="chips-container">
							<label class="chip">
								<input type="checkbox" bind:checked={selectedCategories.world} disabled={status === 'loading'} />
								<span class="chip-text">{$t('nav.world')}</span>
							</label>
							<label class="chip">
								<input type="checkbox" bind:checked={selectedCategories.turkey} disabled={status === 'loading'} />
								<span class="chip-text">{$t('nav.turkey')}</span>
							</label>
							<label class="chip">
								<input type="checkbox" bind:checked={selectedCategories.technology} disabled={status === 'loading'} />
								<span class="chip-text">{$t('nav.technology')}</span>
							</label>
							<label class="chip">
								<input type="checkbox" bind:checked={selectedCategories.economy} disabled={status === 'loading'} />
								<span class="chip-text">{$t('nav.economy')}</span>
							</label>
							<label class="chip">
								<input type="checkbox" bind:checked={selectedCategories.finance} disabled={status === 'loading'} />
								<span class="chip-text">{$t('nav.finance')}</span>
							</label>
							<label class="chip">
								<input type="checkbox" bind:checked={selectedCategories.sports} disabled={status === 'loading'} />
								<span class="chip-text">Spor</span>
							</label>
						</div>
					</div>

					<div class="preferences-group">
						<h3 class="group-title">{$t('subscribe.frequencyTitle')}</h3>
						<div class="segment-control">
							<label class="segment {frequency === 'daily' ? 'active' : ''}">
								<input type="radio" value="daily" bind:group={frequency} disabled={status === 'loading'} />
								<span>{$t('subscribe.freqDaily')}</span>
							</label>
							<label class="segment {frequency === 'weekly' ? 'active' : ''}">
								<input type="radio" value="weekly" bind:group={frequency} disabled={status === 'loading'} />
								<span>{$t('subscribe.freqWeekly')}</span>
							</label>
						</div>
					</div>

					{#if status === 'error'}
						<div class="error-msg" in:fade>{message}</div>
					{/if}

					<button type="submit" class="btn-primary form-btn" disabled={status === 'loading'}>
						{#if status === 'loading'}
							<span class="spinner"></span> {$t('subscribe.btnLoading')}
						{:else}
							{$t('subscribe.btnSubmit')}
						{/if}
					</button>
					
					<p class="terms-text">
						{@html $t('subscribe.terms').replace('{privacy}', `<a href="/gizlilik">${$t('subscribe.privacyLink')}</a>`)}
					</p>
				{/if}
			</form>
		</div>
		
	</div>
</div>

<style>
	.subscribe-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: calc(var(--nav-height) + 4rem) 0 4rem;
		background: var(--bg);
	}

	.wrapper {
		max-width: 600px;
		width: 100%;
	}

	.content-box {
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: 28px;
		padding: 3rem;
		box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05);
	}

	:global([prefers-color-scheme="dark"]) .content-box {
		box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1);
	}

	.header-section {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.icon-wrapper {
		background: var(--apple-gray-100);
		width: 64px;
		height: 64px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
		color: var(--apple-blue);
	}

	:global([prefers-color-scheme="dark"]) .icon-wrapper {
		background: var(--apple-gray-500);
	}

	.title {
		font-size: 2.2rem;
		margin-bottom: 0.75rem;
	}

	.subtitle {
		color: var(--muted);
		font-size: 1.1rem;
		max-width: 400px;
		margin: 0 auto;
		line-height: 1.5;
	}

	.subscribe-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.input-group input {
		width: 100%;
		padding: 1rem 1.25rem;
		font-size: 1.1rem;
		font-family: inherit;
		background: var(--apple-gray-100);
		border: 1px solid transparent;
		border-radius: 14px;
		color: var(--fg);
		transition: all 0.2s ease;
	}

	:global([prefers-color-scheme="dark"]) .input-group input {
		background: var(--apple-gray-500);
	}

	.input-group input:focus {
		outline: none;
		border-color: var(--apple-blue);
		background: var(--bg);
		box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	.group-title {
		font-size: 0.95rem;
		color: var(--fg);
		margin-bottom: 1rem;
		font-weight: 500;
	}

	.chips-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.chip {
		cursor: pointer;
	}

	.chip input {
		display: none;
	}

	.chip-text {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: var(--apple-gray-100);
		color: var(--muted);
		border-radius: 98px;
		font-size: 0.95rem;
		transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
		border: 1px solid transparent;
	}

	:global([prefers-color-scheme="dark"]) .chip-text {
		background: var(--apple-gray-500);
	}

	.chip input:checked + .chip-text {
		background: rgba(0, 102, 204, 0.1);
		color: var(--apple-blue);
		border-color: var(--apple-blue);
		font-weight: 500;
	}
	
	:global([prefers-color-scheme="dark"]) .chip input:checked + .chip-text {
		background: rgba(10, 132, 255, 0.15);
	}

	.segment-control {
		display: flex;
		background: var(--apple-gray-100);
		border-radius: 12px;
		padding: 4px;
		position: relative;
	}

	:global([prefers-color-scheme="dark"]) .segment-control {
		background: var(--apple-gray-500);
	}

	.segment {
		flex: 1;
		text-align: center;
		padding: 0.5rem 0;
		cursor: pointer;
		color: var(--muted);
		font-size: 0.95rem;
		font-weight: 500;
		position: relative;
		z-index: 2;
		border-radius: 9px;
		transition: color 0.2s ease;
	}

	.segment input {
		display: none;
	}

	.segment.active {
		color: var(--fg);
		background: var(--bg);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.form-btn {
		width: 100%;
		padding: 1rem;
		font-size: 1.1rem;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.error-msg {
		color: var(--apple-red);
		font-size: 0.95rem;
		text-align: center;
		background: rgba(255, 59, 48, 0.1);
		padding: 0.75rem;
		border-radius: 10px;
	}

	.terms-text {
		font-size: 0.8rem;
		text-align: center;
		color: var(--muted);
		line-height: 1.5;
	}

	.terms-text a {
		text-decoration: underline;
		color: var(--fg);
	}

	.success-card {
		text-align: center;
		padding: 2rem 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.success-card h3 {
		font-size: 1.5rem;
		color: var(--fg);
	}

	.success-card p {
		color: var(--muted);
		line-height: 1.5;
	}

	.mt-3 {
		margin-top: 1.5rem;
	}

	@media (max-width: 640px) {
		.content-box {
			border-radius: 0;
			border: none;
			box-shadow: none;
			padding: 2rem 1.5rem;
			background: transparent;
		}
	}
</style>
