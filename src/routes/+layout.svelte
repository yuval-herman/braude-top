<script lang="ts">
	import '$lib/global.css';
	import { theme } from '$lib/state.svelte';

	let { children, data } = $props();
	const { themeCookie } = data;

	function validateTheme(themeStr?: string): themeStr is 'auto' | 'light' | 'dark' {
		return !!themeStr && ['auto', 'light', 'dark'].includes(themeStr);
	}

	if (validateTheme(themeCookie) && theme.theme !== themeCookie) {
		theme.theme = themeCookie;
	}
</script>

<svelte:head>
	<meta name="color-scheme" content={theme.theme === 'auto' ? 'light dark' : theme.theme} />
</svelte:head>

<div class="container">
	<nav>
		<ul>
			<li><a href="/">ראשי</a></li>
			<li><a href="/contact">יצירת קשר</a></li>
		</ul>
		<button
			aria-label="שינוי צבעים בהיר/כהה"
			onclick={() => {
				if (theme.theme === 'dark') {
					theme.theme = 'light';
					document.cookie = 'theme=light; SameSite=None; Secure';
				} else {
					theme.theme = 'dark';
					document.cookie = 'theme=dark; SameSite=None; Secure';
				}
			}}
		>
			<svg class="sun-moon" viewBox="0 0 100 100">
				<circle class="sun" cx="50" cy="50" r="30" />
				<circle class="moon-bite" cx={theme.theme === 'light' ? 110 : 65} cy="45" r="30" />
			</svg>
		</button>
	</nav>

	{@render children()}
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		--nav-background: var(--neutral);

		nav {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--border);
			padding: 8px 16px;
			background: var(--nav-background);

			ul {
				list-style-type: none;
				margin: 0;
				padding: 0;
				li {
					display: inline-block;
					padding-left: 8px;
				}
				a {
					text-decoration: none;
					background: var(--bg);
					padding: 4px 8px;
					border-radius: 4px;
					color: inherit;
				}
			}

			button {
				border: none;
				background: inherit;

				.sun-moon {
					width: 28px;
					height: 28px;
				}

				.sun {
					fill: #ffd700;
					transition: fill 2s ease-in-out;
				}

				.moon-bite {
					fill: var(--nav-background);
					transition: all 1s;
				}
			}
		}
	}
</style>
