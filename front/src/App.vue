<script setup lang="ts">
/*  Theme picker  */

import Login from "@/components/Login.vue";

const themeClass: string[] = ['t-dark', 't-light', 't-bonus'];

let selectedTheme: number = 0;

function switchTheme(themeId :number) : void
{
	if (themeId < 0 || themeId >= themeClass.length || themeId === selectedTheme)
		return ;
	
	if (selectedTheme === 2)
		themeId = 0; /* force back to dark when leaving bonus theme */

	let pBody = document.getElementById('bodyid');

	if (!pBody)
		return ;

	pBody.classList.replace(themeClass[selectedTheme], themeClass[themeId]);
	selectedTheme = themeId;

	const pFavicon :HTMLLinkElement | null = document.querySelector("link[rel='icon']");
	
	if (!pFavicon)
		return ;

	pFavicon.href = ((themeId < 2) ? '/42logo.png' : '/42logotrans.png');
}

</script>

<template>
	<div class="c-page">
		<header>
			<nav class="c-nav">
				<RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/chat">Chat</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
				<RouterLink to="/playerprofile">Profile</RouterLink>
				<RouterLink to="/game">Game</RouterLink>
				<RouterLink to="/gameresult">Game result</RouterLink>
				<RouterLink to="/pong">Pong</RouterLink>
			</nav>
			<div class="c-theme-picker">
				<div class="c-theme-picker-button" @click.exact="() => {switchTheme((selectedTheme + 1) % 2);}" @click.shift.exact="() => {switchTheme(2);}">
					<span>Dark</span>
					<span class="c-theme-separator">/</span>
					<span>Light</span>
				</div>
			</div>
		</header>

		<div class="c-subpage">
			<RouterView/>
  			<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-daf495cf13fd1f090c114ac2c7c8c9c0c15d11dee8de959157b2c07821a76d0d&redirect_uri=http%3A%2F%2Flocalhost:8000%2Fauth%2Fintra&response_type=code">LOGIN</a>
		</div>
		<footer>
			<div>
				ft_transcendance by x, y, z, w and h.
			</div>
		</footer>
	</div>


</template>

<style>
header {
	display: flex;
	place-items: center;
	background: var(--color-background-header);
	height: 7rem;
	border-radius: 0px;
	border-bottom: 8px solid var(--color-border-header);
}

footer {
	display: flex;
	place-items: center;
	justify-content: center;
	background: var(--color-background-header);
	height: 5rem;
	border-top: 8px solid var(--color-border-header);
	color: var(--color-text-soft);
}


nav {
  /*width: 100%;*/
  font-size: 24px;
  text-align: center;
}
.c-nav {
  flex: 20;
}

nav a.router-link-exact-active {
  color: var(--color-nav-accent);
  text-decoration: underline;
}

nav li {
  margin-right: 1rem;
}

nav a {
	display: inline-block;
	padding: 2px 0 2px 0;
	border-left: 1px solid var(--color-border);
}

nav a:hover {
  text-decoration: #3a768f;
}

a {
	color: var(--color-text);
	text-decoration: none;
	margin: 0 20px 0 20px;
}

.c-page {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.c-subpage {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
}

.c-theme-picker {
	flex: 3;
	display: flex;
	justify-content: center;
	user-select: none;
}

.c-theme-picker-button {
	cursor: pointer;
	border: 2px solid #202020;
	border-radius: 25px;
	padding: 4px;
	background: var(--color-theme-button-background);
}

.c-theme-separator {
	margin: 0 6px 0 6px;
	color: #202020;
	font-weight: bold;
}

</style>
