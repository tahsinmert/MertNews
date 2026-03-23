<script>
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	/** @param {string} href */
	function active(href) {
		return $page.url.pathname === href;
	}
</script>

<footer class="footer" aria-label="Site footer">
	<div class="container footer-content">
		<div class="footer-brand">
			<a href="/" class="footer-logo-link">
				<img src="/logo.png" alt="MertNews" class="footer-logo-img" width="20" height="20" />
			</a>
		</div>
		<nav class="footer-nav" aria-label="Footer navigation">
			<div class="footer-col">
				<h3>{$t('footer.news')}</h3>
				<a class="footer-link" class:is-active={active('/dunya')} href="/dunya" aria-current={active('/dunya') ? 'page' : undefined}>{$t('nav.world')}</a>
				<a class="footer-link" class:is-active={active('/turkiye')} href="/turkiye" aria-current={active('/turkiye') ? 'page' : undefined}>{$t('nav.turkey')}</a>
				<a class="footer-link" class:is-active={active('/teknoloji')} href="/teknoloji" aria-current={active('/teknoloji') ? 'page' : undefined}>{$t('nav.technology')}</a>
				<a class="footer-link" class:is-active={active('/ekonomi')} href="/ekonomi" aria-current={active('/ekonomi') ? 'page' : undefined}>{$t('nav.economy')}</a>
				<a class="footer-link" class:is-active={active('/finans')} href="/finans" aria-current={active('/finans') ? 'page' : undefined}>{$t('nav.finance')}</a>
				<a class="footer-link" class:is-active={active('/spor')} href="/spor" aria-current={active('/spor') ? 'page' : undefined}>{$t('nav.sports')}</a>
			</div>

			<div class="footer-col">
				<h3>{$t('footer.support')}</h3>
				<a class="footer-link" class:is-active={active('/yardim')} href="/yardim" aria-current={active('/yardim') ? 'page' : undefined}>{$t('footer.help')}</a>
				<a class="footer-link" class:is-active={active('/abone')} href="/abone" aria-current={active('/abone') ? 'page' : undefined}>{$t('footer.subscription')}</a>
				<a class="footer-link" class:is-active={active('/iletisim')} href="/iletisim" aria-current={active('/iletisim') ? 'page' : undefined}>{$t('footer.contact')}</a>
			</div>

			<div class="footer-col">
				<h3>{$t('footer.corporate')}</h3>
				<a class="footer-link" class:is-active={active('/hakkimizda')} href="/hakkimizda" aria-current={active('/hakkimizda') ? 'page' : undefined}>{$t('footer.about')}</a>
				<a class="footer-link" class:is-active={active('/reklam')} href="/reklam" aria-current={active('/reklam') ? 'page' : undefined}>{$t('footer.ads')}</a>
				<a class="footer-link" class:is-active={active('/kariyer')} href="/kariyer" aria-current={active('/kariyer') ? 'page' : undefined}>{$t('footer.careers')}</a>
			</div>

			<div class="footer-col">
				<h3>{$t('footer.account')}</h3>
				<a class="footer-link" class:is-active={active('/profil')} href="/profil" aria-current={active('/profil') ? 'page' : undefined}>{$t('footer.profile')}</a>
				<a class="footer-link" class:is-active={active('/ayarlar')} href="/ayarlar" aria-current={active('/ayarlar') ? 'page' : undefined}>{$t('footer.settings')}</a>
			</div>
		</nav>

		<div class="footer-bottom">
			<div class="footer-legal">
				<span class="copyright">{$t('footer.copyright')}</span>
				<div class="legal-links" aria-label="Legal links">
					<a class="footer-link footer-legal-link" class:is-active={active('/gizlilik')} href="/gizlilik" aria-current={active('/gizlilik') ? 'page' : undefined}>{$t('footer.privacy')}</a>
					<a class="footer-link footer-legal-link" class:is-active={active('/cerezler')} href="/cerezler" aria-current={active('/cerezler') ? 'page' : undefined}>{$t('footer.cookies')}</a>
					<a class="footer-link footer-legal-link" class:is-active={active('/kullanim-sartlari')} href="/kullanim-sartlari" aria-current={active('/kullanim-sartlari') ? 'page' : undefined}>{$t('footer.terms')}</a>
					<a class="footer-link footer-legal-link" class:is-active={active('/site-haritasi')} href="/site-haritasi" aria-current={active('/site-haritasi') ? 'page' : undefined}>{$t('footer.sitemap')}</a>
				</div>
			</div>
			<div class="footer-country">{$t('footer.country')}</div>
		</div>
	</div>
</footer>

<style>
	.footer {
		margin-top: 0;
		padding: 1.75rem 0 1.5rem;
		border-top: 1px solid var(--card-border);
		background: var(--apple-gray-100);
		color: var(--muted);
	}

	:global([prefers-color-scheme='dark']) .footer {
		background: var(--apple-gray-600);
	}

	.footer-content {
		max-width: var(--apple-container);
		margin: 0 auto;
		padding-left: max(22px, env(safe-area-inset-left));
		padding-right: max(22px, env(safe-area-inset-right));
	}

	.footer-brand {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--card-border);
	}

	.footer-logo-link {
		display: inline-flex;
		align-items: center;
		transition: opacity 0.2s ease;
	}

	.footer-logo-link:hover {
		opacity: 0.7;
	}

	.footer-logo-img {
		width: 20px;
		height: 20px;
		object-fit: contain;
	}

	.footer-nav {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 20px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--card-border);
	}

	.footer-col {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.footer-col h3 {
		color: var(--fg);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin-bottom: 0.15rem;
	}

	.footer-link {
		display: inline-flex;
		align-items: center;
		color: var(--muted);
		font-size: 0.8125rem;
		letter-spacing: -0.01em;
		padding: 6px 0;
		min-height: 44px;
		transition: color 0.2s ease;
	}

	.footer-link:hover {
		color: var(--fg);
		text-decoration: underline;
	}

	.footer-link:focus-visible {
		outline: 2px solid rgba(0, 102, 204, 0.35);
		outline-offset: 4px;
		border-radius: 6px;
	}

	.footer-link.is-active {
		color: var(--fg);
	}

	.footer-bottom {
		padding-top: 20px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 24px;
	}

	.footer-legal {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.copyright {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.legal-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	.footer-legal-link {
		position: relative;
		padding-right: 0.75rem;
	}

	.footer-legal-link:not(:first-child)::before {
		content: '';
		position: absolute;
		left: -0.45rem;
		top: 50%;
		transform: translateY(-50%);
		width: 1px;
		height: 12px;
		background: var(--card-border);
	}

	.footer-country {
		color: var(--muted);
		font-size: 0.8rem;
		padding-top: 4px;
	}

	@media (max-width: 900px) {
		.footer-nav {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 38px;
		}

		.footer-bottom {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 520px) {
		.footer {
			padding: 1.5rem 0 calc(1.5rem + env(safe-area-inset-bottom, 0px));
		}

		.footer-nav {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.footer-col {
			gap: 0;
		}
	}
</style>

