<script>
	import { selectedArticleStore } from '$lib/stores/modal';
	import { fade, fly } from 'svelte/transition';

	function close() {
		selectedArticleStore.set(null);
	}

	$: if (typeof document !== 'undefined') {
		if ($selectedArticleStore) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}
</script>

{#if $selectedArticleStore}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="modal-backdrop"
		transition:fade={{ duration: 280, easing: (x) => 1 - Math.pow(1 - x, 3) }}
		on:click={close}
	>
		<div
			class="modal-sheet"
			transition:fly={{ y: 28, duration: 420, easing: (x) => 1 - Math.pow(1 - x, 4) }}
			on:click|stopPropagation
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-article-title"
		>
			<header class="modal-toolbar">
				<div class="toolbar-main">
					<p class="toolbar-eyebrow">{$selectedArticleStore.source}</p>
					<h2 id="modal-article-title" class="toolbar-title">{$selectedArticleStore.title}</h2>
				</div>
				<div class="toolbar-actions">
					<a
						href={$selectedArticleStore.link}
						target="_blank"
						rel="noopener noreferrer"
						class="tool-btn"
						title="Kaynakta aç"
					>
						<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							<polyline points="15 3 21 3 21 9" />
							<line x1="10" y1="14" x2="21" y2="3" />
						</svg>
					</a>
					<button type="button" class="tool-btn tool-btn-close" on:click={close} aria-label="Kapat">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			</header>

			<div class="modal-frame">
				<iframe
					src={$selectedArticleStore.link}
					title={$selectedArticleStore.title}
					frameborder="0"
					sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
				></iframe>
				<div class="frame-loading" aria-hidden="true">
					<div class="spinner"></div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom))
			max(16px, env(safe-area-inset-left));
		background: rgba(0, 0, 0, 0.36);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
	}

	.modal-sheet {
		background: var(--bg);
		width: 100%;
		max-width: min(980px, 100%);
		height: min(88vh, 100%);
		max-height: calc(100vh - 32px);
		border-radius: 18px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: var(--apple-tile-shadow-hover), 0 0 0 1px var(--card-border);
		border: 1px solid var(--card-border);
	}

	.modal-toolbar {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 14px 18px 12px;
		background: var(--glass-bg);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-bottom: 1px solid var(--card-border);
		flex-shrink: 0;
	}

	.toolbar-main {
		min-width: 0;
		flex: 1;
	}

	.toolbar-eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--apple-blue);
		margin: 0 0 4px;
	}

	.toolbar-title {
		font-family: var(--font-main);
		font-size: 0.9375rem;
		font-weight: 600;
		line-height: 1.35;
		letter-spacing: -0.02em;
		color: var(--fg);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.tool-btn {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.06);
		color: var(--fg);
		cursor: pointer;
		transition:
			background 0.2s ease,
			transform 0.2s ease;
		text-decoration: none;
		opacity: 1;
	}

	.tool-btn:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	:global([prefers-color-scheme='dark']) .tool-btn {
		background: rgba(255, 255, 255, 0.1);
	}

	:global([prefers-color-scheme='dark']) .tool-btn:hover {
		background: rgba(255, 255, 255, 0.16);
	}

	.tool-btn-close {
		background: rgba(0, 0, 0, 0.05);
	}

	.modal-frame {
		flex: 1;
		position: relative;
		min-height: 0;
		background: var(--bg);
	}

	.modal-frame iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: none;
		z-index: 2;
		background: var(--bg);
	}

	.frame-loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		z-index: 1;
		pointer-events: none;
	}

	.spinner {
		width: 28px;
		height: 28px;
		border: 2.5px solid var(--apple-gray-200);
		border-top-color: var(--apple-blue);
		border-radius: 50%;
		animation: spin 0.85s linear infinite;
	}

	:global([prefers-color-scheme='dark']) .spinner {
		border-color: var(--apple-gray-500);
		border-top-color: var(--apple-blue);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 734px) {
		.modal-backdrop {
			align-items: flex-end;
			padding: 0;
		}

		.modal-sheet {
			max-width: 100%;
			height: 92dvh;
			height: 92vh;
			max-height: none;
			border-radius: 18px 18px 0 0;
			padding-bottom: env(safe-area-inset-bottom, 0px);
		}
	}
</style>
