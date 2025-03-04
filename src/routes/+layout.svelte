<script lang="ts">
	import '$lib/global.css';
	import 'driver.js/dist/driver.css';

	import { enhance } from '$app/forms';
	import { afterNavigate, goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { loadCourses } from '$lib/courseManager.svelte.js';
	import { showHelp } from '$lib/help.js';
	import { settings } from '$lib/settings.svelte.js';
	import { selectedEmptyRooms, theme } from '$lib/state.svelte';
	import { getCurrentEmptyRooms } from '$lib/storage.js';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	if (validateTheme(data.themeCookie) && theme.theme !== data.themeCookie) {
		theme.theme = data.themeCookie;
	}

	onMount(() => {
		if (data.settings) settings.set(data.settings);
		loadCourses();
	});

	afterNavigate(() => {
		loadCourses();

		selectedEmptyRooms.length = 0;
		selectedEmptyRooms.push(...getCurrentEmptyRooms(data.year, data.semester));
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
		<div>
			<span>שנת {data.year}</span>
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
						Cookies.set('year', year);
						Cookies.set('semester', semester);
						goto(url, { replaceState: false, state: page.state });
					}}
				>
					{#each data.availableTimeSpans as { year, semesters }}
						<optgroup label={year.toString()}>
							{#each semesters as semester}
								<option
									value={JSON.stringify({ year, semester })}
									selected={year === data.year && semester === data.semester}>{semester}</option
								>
							{/each}
						</optgroup>
					{/each}
				</select>
			</label>
		</div>
		<ul>
			{#if data.user}<li>{data.user?.name}</li>{/if}
			<li>
				<a href="/settings" aria-label="הגדרות" id="settings" class="icon-cog"></a>
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
			<li>
				<a
					class="icon-whatsapp"
					href="https://chat.whatsapp.com/C9xSvcmtHkSFNZeT7MUO4Y"
					target="_blank"
					aria-label="לינק לקבוצת וואסטפ"
				></a>
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
			div {
				margin: 0 16px;
			}

			ul {
				display: flex;
				align-items: center;
				list-style-type: none;
				margin: 0;
				padding: 0;
				gap: 8px;
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
					font-size: 1.3em;
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
			.icon-whatsapp {
				font-size: 28px;
				color: greenyellow;
				background: light-dark(var(--text-secondary), #0000);
				border-radius: 25%;
				padding: 0;
			}

			.theme {
				background: var(--neutral);
				padding: 0;

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
