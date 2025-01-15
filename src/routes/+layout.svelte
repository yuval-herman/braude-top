<script lang="ts">
	import '$lib/global.css';
	import 'driver.js/dist/driver.css';

	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { showHelp } from '$lib/help.js';
	import { selectedCourses, theme } from '$lib/state.svelte';
	import { exportTable } from '$lib/tableExport.js';
	import { itemizeCourseList } from '$lib/utils.js';

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
			<li><a href="/contact">יצירת קשר</a></li>
			<li>
				<a href="#top" onclick={() => exportTable(itemizeCourseList(selectedCourses))}>ייצא מערכת</a
				>
			</li>
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
			<li>
				<button aria-label="עזרה" class="help" id="help-button" onclick={() => showHelp(page)}
					>?</button
				>
			</li>
			<li>
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
		--nav-background: var(--neutral);

		nav {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--border);
			padding: 8px 16px;
			background: var(--nav-background);

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
				a {
					text-decoration: none;
					background: var(--bg);
					padding: 4px 8px;
					border-radius: 4px;
					color: inherit;
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
