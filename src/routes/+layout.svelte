<script>
	import Navbar from '../components/Navbar.svelte';
	import CurrencyTicker from '../components/CurrencyTicker.svelte';
	import ArticleModal from '../components/ArticleModal.svelte';
	import Footer from '../components/Footer.svelte';
	import { navigating } from '$app/stores';
	import { locale } from '$lib/i18n';
	import { fade } from 'svelte/transition';
	import '../app.css';

	/** @type {import('./$types').LayoutData} */
	export let data;

	// Initial locale sync from server cookie
	$: if (data.locale) {
		locale.set(data.locale);
	}

	$: if (typeof document !== 'undefined') {
		document.documentElement.lang = $locale;
	}
</script>

{#if $navigating}
	<div class="loading-bar" in:fade={{ duration: 200 }} out:fade={{ duration: 500 }}>
		<div class="glow"></div>
	</div>
{/if}

<div class="app-layout">
	<Navbar feedNav={data.feedNav ?? []} />
	<CurrencyTicker data={data.currencyData} />
	<main class="main-fill">
		<slot />
	</main>
	<Footer />
	<!-- Apple Style Article Preview Modal -->
	<ArticleModal />
</div>

<style>
	:global(body) {
		overflow-x: hidden;
	}
	
	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.loading-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		z-index: 9999;
		overflow: hidden;
	}

	.glow {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent 0%, var(--apple-blue) 50%, transparent 100%);
		animation: loading-slide 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	@keyframes loading-slide {
		from { transform: translateX(-100%); }
		to { transform: translateX(200%); }
	}

	.main-fill {
		width: 100%;
		flex: 1 0 auto;
	}
</style>
