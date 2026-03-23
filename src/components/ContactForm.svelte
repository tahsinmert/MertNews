<script>
	import { t } from '$lib/i18n';

	let name = '';
	let email = '';
	let subject = 'general';
	let message = '';
	let status = 'idle'; // idle | success

	const subjects = [
		{ value: 'general', key: 'page.contact.form.subject.general' },
		{ value: 'press', key: 'page.contact.form.subject.press' },
		{ value: 'ads', key: 'page.contact.form.subject.ads' },
		{ value: 'support', key: 'page.contact.form.subject.support' },
		{ value: 'legal', key: 'page.contact.form.subject.legal' }
	];

	function submit(e) {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !message.trim()) {
			return;
		}
		status = 'success';
	}
</script>

<div class="form-card apple-glass">
	<h2 class="form-title">{$t('page.contact.form.title')}</h2>

	{#if status === 'success'}
		<p class="success" role="status">{$t('page.contact.form.success')}</p>
		<button type="button" class="btn-reset" on:click={() => { status = 'idle'; name = ''; email = ''; message = ''; }}>
			{$t('subscribe.btnReset')}
		</button>
	{:else}
		<form class="form" on:submit={submit} novalidate>
			<div class="field">
				<label for="c-name">{$t('page.contact.form.name')}</label>
				<input id="c-name" type="text" bind:value={name} autocomplete="name" required />
			</div>
			<div class="field">
				<label for="c-email">{$t('page.contact.form.email')}</label>
				<input id="c-email" type="email" bind:value={email} autocomplete="email" required />
			</div>
			<div class="field">
				<label for="c-subject">{$t('page.contact.form.subject')}</label>
				<select id="c-subject" bind:value={subject}>
					{#each subjects as s}
						<option value={s.value}>{$t(s.key)}</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label for="c-msg">{$t('page.contact.form.message')}</label>
				<textarea id="c-msg" rows="6" bind:value={message} required></textarea>
			</div>
			<button type="submit" class="btn-submit">{$t('page.contact.form.submit')}</button>
		</form>
	{/if}
</div>

<style>
	.form-card {
		margin-top: 20px;
		padding: 28px 24px;
		border-radius: 20px;
		border: 1px solid var(--glass-border);
	}

	.form-title {
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 20px;
		color: var(--fg);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.field label {
		display: block;
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--muted);
		margin-bottom: 8px;
	}

	.field input,
	.field select,
	.field textarea {
		width: 100%;
		padding: 12px 14px;
		border-radius: 12px;
		border: 1px solid var(--card-border);
		background: var(--bg);
		color: var(--fg);
		font-size: 0.95rem;
		font-family: inherit;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.field input:focus,
	.field select:focus,
	.field textarea:focus {
		outline: none;
		border-color: rgba(0, 102, 204, 0.45);
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.12);
	}

	:global([prefers-color-scheme='dark']) .field input:focus,
	:global([prefers-color-scheme='dark']) .field select:focus,
	:global([prefers-color-scheme='dark']) .field textarea:focus {
		border-color: rgba(10, 132, 255, 0.5);
		box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.15);
	}

	.field textarea {
		resize: vertical;
		min-height: 140px;
	}

	.btn-submit {
		align-self: flex-start;
		margin-top: 4px;
		padding: 12px 28px;
		min-height: 44px;
		border-radius: 980px;
		border: none;
		background: var(--apple-blue);
		color: #fff;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-submit:hover {
		background: var(--apple-blue-hover);
	}

	.success {
		font-size: 1rem;
		color: var(--fg);
		line-height: 1.6;
		margin-bottom: 16px;
	}

	.btn-reset {
		padding: 10px 20px;
		min-height: 44px;
		border-radius: 980px;
		border: 1px solid var(--card-border);
		background: transparent;
		color: var(--accent);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-reset:hover {
		color: var(--apple-blue-hover);
	}

	@media (max-width: 640px) {
		.form-card {
			padding: 20px 16px;
		}

		.btn-submit {
			align-self: stretch;
		}
	}
</style>
