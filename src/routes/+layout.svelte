<script lang="ts">
	import '$lib/global.css';
	import 'driver.js/dist/driver.css';

	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { showHelp } from '$lib/help.js';
	import { theme } from '$lib/state.svelte';
	import { enhance } from '$app/forms';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { settings } from '$lib/settings.svelte.js';

	let { children, data } = $props();

	const { themeCookie } = data;

	if (validateTheme(themeCookie) && theme.theme !== themeCookie) {
		theme.theme = themeCookie;
	}

	onMount(() => {
		if (data.settings) settings.set(data.settings);
	});

	$effect(() => {
		if (data.savedTimetable) console.log(data.savedTimetable);
	});

	onNavigate(({ to, type }) => {
		if (!to || type !== 'link') return;
		window.goatcounter &&
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
		<ul id="page-links">
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
			{#if data.user}<li>{data.user?.name}</li>{/if}
			<li>
				<a href="/settings" aria-label="הגדרות" id="settings"
					><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
						><path
							d="m21.32 9.55-1.89-.63.89-1.78A1 1 0 0 0 20.13 6L18 3.87a1 1 0 0 0-1.15-.19l-1.78.89-.63-1.89A1 1 0 0 0 13.5 2h-3a1 1 0 0 0-.95.68l-.63 1.89-1.78-.89A1 1 0 0 0 6 3.87L3.87 6a1 1 0 0 0-.19 1.15l.89 1.78-1.89.63a1 1 0 0 0-.68.94v3a1 1 0 0 0 .68.95l1.89.63-.89 1.78A1 1 0 0 0 3.87 18L6 20.13a1 1 0 0 0 1.15.19l1.78-.89.63 1.89a1 1 0 0 0 .95.68h3a1 1 0 0 0 .95-.68l.63-1.89 1.78.89a1 1 0 0 0 1.13-.19L20.13 18a1 1 0 0 0 .19-1.15l-.89-1.78 1.89-.63a1 1 0 0 0 .68-.94v-3a1 1 0 0 0-.68-.95M20 12.78l-1.2.4A2 2 0 0 0 17.64 16l.57 1.14-1.1 1.1-1.11-.6a2 2 0 0 0-2.79 1.16l-.4 1.2h-1.59l-.4-1.2A2 2 0 0 0 8 17.64l-1.14.57-1.1-1.1.6-1.11a2 2 0 0 0-1.16-2.82l-1.2-.4v-1.56l1.2-.4A2 2 0 0 0 6.36 8l-.57-1.11 1.1-1.1L8 6.36a2 2 0 0 0 2.82-1.16l.4-1.2h1.56l.4 1.2A2 2 0 0 0 16 6.36l1.14-.57 1.1 1.1-.6 1.11a2 2 0 0 0 1.16 2.79l1.2.4ZM12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2"
						/></svg
					></a
				>
			</li>
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
			flex-shrink: 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--border);
			padding: 8px 16px;
			background: var(--neutral);
			overflow-x: auto;
			label {
				margin: 0 16px;
			}

			ul {
				display: flex;
				align-items: center;
				list-style-type: none;
				margin: 0;
				padding: 0;
				gap: 12px;
				li {
					display: inline-block;
				}
				a,
				button {
					display: block;
					text-decoration: none;
					background: var(--bg);
					padding: 4px 8px;
					border-radius: 4px;
					color: inherit;
					& > * {
						vertical-align: middle;
					}
				}
				#settings {
					fill: var(--text);
					background: none;
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
