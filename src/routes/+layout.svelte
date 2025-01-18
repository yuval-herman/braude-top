<script lang="ts">
	import '$lib/global.css';
	import 'driver.js/dist/driver.css';

	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { showHelp } from '$lib/help.js';
	import { theme } from '$lib/state.svelte';
	import { enhance } from '$app/forms';
	import Cookies from 'js-cookie';

	let { children, data } = $props();

	const { themeCookie } = data;

	if (validateTheme(themeCookie) && theme.theme !== themeCookie) {
		theme.theme = themeCookie;
	}

	onNavigate(({ to, type }) => {
		if (!to || type !== 'link') return;
		window.goatcounter.count({
			path: to.url.pathname,
		});
	});

	function validateTheme(themeStr?: string): themeStr is 'auto' | 'light' | 'dark' {
		return !!themeStr && ['auto', 'light', 'dark'].includes(themeStr);
	}
</script>

<svelte:head>
	<link rel="canonical" href={page.url.origin + page.url.pathname} />
	<meta name="color-scheme" content={theme.theme === 'auto' ? 'light dark' : theme.theme} />
</svelte:head>

<div class="container">
	<nav>
		<ul>
			<li><a href="/">ראשי</a></li>
			<li><a href="/rooms">חדרים ריקים</a></li>
			<li><a href="/contact">יצירת קשר</a></li>
			{#if data.user}
				<li>
					<form method="post" action="/login?/log-out" use:enhance>
						<button>התנתק</button>
					</form>
				</li>
				{#if data.user.role === 'admin'}
					<li><a href="/admin">ניהול אתר</a></li>
				{/if}
			{:else}
				<li><a href="/login/google">התחברות</a></li>
			{/if}
		</ul>
		<label
			>סמסטר
			<select
				name="year-semester"
				id="year-semester"
				onchange={({ currentTarget: { value } }) => {
					const { year, semester } = JSON.parse(value);
					const url = new URL(page.url);
					url.searchParams.set('year', year);
					url.searchParams.set('semester', semester);
					goto(url, { replaceState: false, state: page.state });
				}}
			>
				{#each data.availableTimeSpans as { year, semesters }}
					<optgroup label={year.toString()}>
						{#each semesters as semester}
							<option value={JSON.stringify({ year, semester })}>{semester}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</label>
		<ul>
			<li>{data.user?.name}</li>
			<li>
				<button aria-label="עזרה" class="help" id="help-button" onclick={() => showHelp(page)}
					>?</button
				>
			</li>
			<li>
				<button
					class="theme"
					aria-label="שינוי צבעים בהיר/כהה"
					onclick={() => {
						if (theme.theme === 'dark') {
							theme.theme = 'light';
							Cookies.set('theme', 'light', { expires: Infinity, sameSite: 'lax' });
						} else {
							theme.theme = 'dark';
							Cookies.set('theme', 'dark', { expires: Infinity, sameSite: 'lax' });
						}
					}}
				>
					<svg class="sun-moon" viewBox="0 0 100 100">
						<circle class="sun" cx="50" cy="50" r="40" />
						<circle class="moon-bite" cx={theme.theme === 'light' ? 150 : 65} cy="45" r="30" />
					</svg>
				</button>
			</li>
		</ul>
	</nav>

	{@render children()}
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;

		nav {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--border);
			padding: 8px 16px;
			background: var(--neutral);

			ul {
				display: flex;
				align-items: center;
				list-style-type: none;
				margin: 0;
				padding: 0;
				gap: 4px;
				li {
					display: inline-block;
					padding-left: 8px;
				}
				a,
				button {
					text-decoration: none;
					background: var(--bg);
					padding: 4px 8px;
					border-radius: 4px;
					color: inherit;
				}
				button {
					font-size: medium;
					cursor: pointer;
				}
			}

			.help {
				font-size: 28px;
				color: light-dark(var(--dark), var(--light));
				background: var(--info);
				padding: 0 8px;
				font-weight: bold;
				border-radius: 8px;
			}
			button {
				border: none;
			}

			.theme {
				background: var(--neutral);

				.sun-moon {
					width: 28px;
					height: 28px;
				}

				.sun {
					fill: #ffd700;
					stroke: black;
					stroke-width: 1;
					transition: fill 2s ease-in-out;
				}

				.moon-bite {
					fill: var(--neutral);
					transition: all 1s;
				}
			}
		}
	}
</style>
