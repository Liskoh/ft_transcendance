<script setup lang="ts">


</script>

<template>
  <div id="app">
    <header>
      <nav>
        <ul>
          <li><router-link to="/chat">Chat</router-link></li>
          <li><router-link to="/login">Login</router-link></li>
          <li><router-link to="/upload">Upload</router-link></li>
          <li><router-link to="/settings">Settings</router-link></li>
          <li><router-link to="/pong">Pong</router-link></li>
        </ul>
      </nav>
    </header>

    <router-view></router-view>
  </div>
</template>

<style>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #333;
  color: white;
  padding: 1rem;
}

nav ul {
  list-style: none;
  display: flex;
  justify-content: space-between;
}

nav li {
  margin-right: 1rem;
}

nav a {
  color: white;
  font-size: 2.2rem;
  text-decoration: none;
}

nav a:hover {
  text-decoration: #3a768f;
}
</style>
