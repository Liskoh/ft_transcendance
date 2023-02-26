<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import io from 'socket.io-client'
import HelloWorld from './components/HelloWorld.vue'
import {SOCKET_SERVER} from "@/consts";

const logout = () => {
  // Code pour exécuter la déconnexion de l'utilisateur ici

  //
  SOCKET_SERVER.on('connect', () => {
    console.log('Socket connected');
    SOCKET_SERVER.emit('logout');
  });


  SOCKET_SERVER.on('userBlocked', () => {
    console.log('User blocked');
  });

    SOCKET_SERVER.on('userError', data => {
    console.log('error ' + data.message);
  });
  SOCKET_SERVER.emit('blockUser', {d: 'd'});

  // SOCKET_SERVER.on('blockUser', data  => {
  //   console.log('Logged in successfully');
  //   console.log(data);
  // });

  // socket.on('logout', () => {
  //   console.log('Logged out successfully');
  //   socket.disconnect();
  // });
}

</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/playerprofile">Your profile</RouterLink>
        <RouterLink to="/game">Game</RouterLink>
        <RouterLink to="/gameresult">Game result</RouterLink>
        <RouterLink to="/pong">Pong</RouterLink>

<!--        //create button who execute a function:-->
        <button @click="logout">SOCKET</button>
      </nav>
    </div>
  </header>

  <RouterView />
  <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-daf495cf13fd1f090c114ac2c7c8c9c0c15d11dee8de959157b2c07821a76d0d&redirect_uri=http%3A%2F%2Flocalhost:8000%2Fauth%2Fintra&response_type=code">LOGIN</a>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}


.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
