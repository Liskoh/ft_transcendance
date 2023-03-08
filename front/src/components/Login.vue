<template>
  <div>
    <label>Username:</label>
    <input type="text" v-model="username">
    <button @click="registerUser">Register</button>
  </div>
</template>

<script lang="ts">
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST } from "@/consts";

interface ComponentData {
  username: string;
  registerUser(): Promise<void>;
}

export default {
  mounted() {
    console.log(VUE_APP_WEB_HOST);
    console.log('test');
  },
  data(): ComponentData {
    return {
      username: "",
      async registerUser() {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: this.username }),
        };
        const input: string = 'http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/auth/register';
        try {
          const register = await fetch(
              input,
              requestOptions
          );
          const dataRegister = await register.json();

          if (dataRegister.status === 200) {
            console.log("success");
            localStorage.setItem("token", dataRegister.access_token);
            return;
          }
        } catch (error) {
          console.log(error);
        }

      },
    };
  },
};
</script>
