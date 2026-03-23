<script>
	/** @type {'carousel' | 'grid'} */
	export let layout = 'carousel';
</script>

{#if layout === 'grid'}
	<div class="grid-sk" aria-hidden="true">
		<div class="grid-sk-media skeleton"></div>
		<div class="grid-sk-body">
			<div class="sk-line sk-grid-title skeleton"></div>
			<div class="sk-line sk-grid-tag skeleton"></div>
			<div class="grid-sk-pills">
				<div class="sk-pill skeleton"></div>
				<div class="sk-pill skeleton"></div>
			</div>
		</div>
	</div>
{:else}
	<div class="tile skeleton-tile">
		<div class="tile-media skeleton"></div>
		<div class="tile-body">
			<div class="sk-line sk-eyebrow skeleton"></div>
			<div class="sk-line sk-title skeleton"></div>
			<div class="sk-line sk-title short skeleton"></div>
			<div class="sk-line sk-meta skeleton"></div>
			<div class="sk-cta skeleton"></div>
		</div>
	</div>
{/if}

<style>
	.tile {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--card-bg);
		border-radius: 18px;
		overflow: hidden;
		border: 1px solid var(--card-border);
		box-shadow: var(--apple-tile-shadow);
	}

	.tile-media {
		aspect-ratio: 16 / 9;
		width: 100%;
	}

	.tile-body {
		padding: 1.25rem 1.35rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
	}

	.grid-sk {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 580px;
		background: var(--apple-gray-100);
		overflow: hidden;
	}

	:global([prefers-color-scheme='dark']) .grid-sk {
		background: var(--apple-gray-600);
	}

	.grid-sk-media {
		flex: 1 1 auto;
		width: 100%;
		min-height: 0;
	}

	.grid-sk-body {
		padding: 2rem 2rem 2.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
		flex-shrink: 0;
	}

	.sk-line {
		border-radius: 6px;
		height: 12px;
	}

	.sk-eyebrow {
		width: 88px;
		height: 10px;
	}

	.sk-title {
		width: 100%;
		max-width: 280px;
		height: 18px;
	}

	.sk-title.short {
		max-width: 220px;
	}

	.sk-grid-title {
		width: 100%;
		max-width: 320px;
		height: 26px;
	}

	.sk-grid-tag {
		width: 100%;
		max-width: 260px;
		height: 16px;
	}

	.sk-meta {
		width: 160px;
		height: 11px;
		margin-top: 0.25rem;
	}

	.sk-cta {
		width: 140px;
		height: 14px;
		margin-top: 0.5rem;
		border-radius: 6px;
	}

	.grid-sk-pills {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.65rem;
		margin-top: 0.75rem;
	}

	.sk-pill {
		width: 140px;
		height: 44px;
		border-radius: 980px;
	}

	@media (max-width: 734px) {
		.grid-sk {
			min-height: 360px;
		}
		.grid-sk-body {
			padding: 1.25rem 1rem 1.5rem;
		}
	}
</style>
