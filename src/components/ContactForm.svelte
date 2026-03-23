<script>
	import { t } from '$lib/i18n';

	let name = '';
	let email = '';
	let subject = 'general';
	let message = '';
	let status = 'idle';

	const subjects = [
		{ value: 'general', key: 'page.contact.form.subject.general' },
		{ value: 'press', key: 'page.contact.form.subject.press' },
		{ value: 'ads', key: 'page.contact.form.subject.ads' },
		{ value: 'support', key: 'page.contact.form.subject.support' },
		{ value: 'legal', key: 'page.contact.form.subject.legal' }
	];

	function submit(e) {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !message.trim()) return;
		status = 'success';
	}
</script>

<div class="cf">
	<h2 class="cf-title">{$t('page.contact.form.title')}</h2>

	{#if status === 'success'}
		<p class="cf-done">{$t('page.contact.form.success')}</p>
		<button type="button" class="cf-link" on:click={() => { status = 'idle'; name = ''; email = ''; message = ''; }}>
			{$t('subscribe.btnReset')}
		</button>
	{:else}
		<form class="cf-form" on:submit={submit} novalidate>
			<div class="cf-field">
				<label for="c-name">{$t('page.contact.form.name')}</label>
				<input id="c-name" type="text" bind:value={name} autocomplete="name" required />
			</div>
			<div class="cf-field">
				<label for="c-email">{$t('page.contact.form.email')}</label>
				<input id="c-email" type="email" bind:value={email} autocomplete="email" required />
			</div>
			<div class="cf-field">
				<label for="c-subject">{$t('page.contact.form.subject')}</label>
				<select id="c-subject" bind:value={subject}>
					{#each subjects as s}
						<option value={s.value}>{$t(s.key)}</option>
					{/each}
				</select>
			</div>
			<div class="cf-field">
				<label for="c-msg">{$t('page.contact.form.message')}</label>
				<textarea id="c-msg" rows="5" bind:value={message} required></textarea>
			</div>
			<button type="submit" class="cf-submit">{$t('page.contact.form.submit')}</button>
		</form>
	{/if}
</div>

<style>
	.cf {
		margin-top: 0;
		padding: 2rem 0;
		border-top: 1px solid var(--card-border);
	}

	.cf-title {
		font-size: 1.375rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--fg);
		margin: 0 0 1.25rem;
	}

	.cf-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.cf-field label {
		display: block;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--fg);
		margin-bottom: 0.375rem;
	}

	.cf-field input,
	.cf-field select,
	.cf-field textarea {
		width: 100%;
		padding: 0.75rem 0.875rem;
		border-radius: 10px;
		border: 1.5px solid var(--card-border);
		background: var(--apple-gray-100, #f5f5f7);
		color: var(--fg);
		font-size: 0.9375rem;
		font-family: inherit;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	:global([prefers-color-scheme='dark']) .cf-field input,
	:global([prefers-color-scheme='dark']) .cf-field select,
	:global([prefers-color-scheme='dark']) .cf-field textarea {
		background: rgba(255, 255, 255, 0.06);
	}

	.cf-field input:focus,
	.cf-field select:focus,
	.cf-field textarea:focus {
		outline: none;
		border-color: var(--apple-blue);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--apple-blue) 18%, transparent);
	}

	.cf-field textarea {
		resize: vertical;
		min-height: 120px;
	}

	.cf-submit {
		align-self: flex-start;
		padding: 0.75rem 1.75rem;
		min-height: 44px;
		border-radius: 10px;
		border: none;
		background: var(--apple-blue);
		color: #fff;
		font-size: 0.9375rem;
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.cf-submit:active {
		opacity: 0.78;
	}

	.cf-done {
		font-size: 1rem;
		color: var(--fg);
		line-height: 1.6;
		margin: 0 0 0.75rem;
	}

	.cf-link {
		background: none;
		border: none;
		color: var(--apple-blue);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		padding: 0;
	}

	.cf-link:hover {
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.cf-submit {
			align-self: stretch;
		}
	}
</style>
