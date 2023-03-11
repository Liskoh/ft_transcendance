<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>
        ft_transcendence
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-navbar
          :items="navItems"
          :value="activeNavItem"
          @input="activeNavItem = $event"
          dense
          flat
      />
    </v-app-bar>
    <v-main>
      <RouterView/>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { ref } from 'vue';

const drawer = ref(false);

const navItems = [
  { text: 'Chat', value: 'chat', to: '/chat' },
  { text: 'Game', value: 'game', to: '/game' },
  { text: 'Settings', value: 'settings', to: '/settings' },
  { text: 'Pong', value: 'pong', to: '/pong' }
];

const activeNavItem = ref(navItems[0].value);
</script>

<style>
.v-toolbar__title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 24px;
}

.v-main {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #2C3E50;
  color: white;
}
</style>
