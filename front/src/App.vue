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
export default {
  data() {
    return {
      // hover: false,
      dialog: false,
      text: ''
    }
  },
  created() {

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
.v-main {
  background-color: background;
}
</style>
