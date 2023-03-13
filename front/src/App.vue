<template>
  <v-app>
    <v-app-bar color="primary">
      <v-spacer></v-spacer>
      <v-btn @click="dialog = true" icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-dialog v-model="dialog">
        <v-text-field label="Enter Nickname" v-model="text"></v-text-field>
        <v-btn @click="search">SEARCH</v-btn>
      </v-dialog>
      <router-link to="/chat">
        <v-btn icon>
          <v-icon>mdi-message</v-icon>
        </v-btn>
      </router-link>
      <router-link to="/game">
        <v-btn icon>
          <v-icon>mdi-gamepad-variant</v-icon>
        </v-btn>
      </router-link>
      <router-link to="/settings">
        <v-btn icon>
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </router-link>
    </v-app-bar>
    <v-main>
      <router-view>
      </router-view>
    </v-main>
  </v-app>
</template>

<script>
import {store} from "@/stores/store";
import io from "socket.io-client";
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";

export default {
  name: 'App',
  store,
  data() {
    return {
      // hover: false,
      dialog: false,
      text: ''
    }
  },
  created() {
    const socket = this.$store.getters.getUserSocket();
    console.log('app vue created');
    if (!socket) {
      this.$store.commit('setUserSocket', io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/users', {
        extraHeaders: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }));
    }
  },
  methods: {
    search() {
      this.$router.push({name: 'profile', params: {nickname: this.text}});
      this.dialog = false;
      this.text = ''
    }
  }
}
</script>

<style>
</style>
