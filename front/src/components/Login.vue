<template>
  <div>
    <label>Username:</label>
    <input type="text" v-model="username">
    <button @click="registerUser">Register</button>

    <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-daf495cf13fd1f090c114ac2c7c8c9c0c15d11dee8de959157b2c07821a76d0d&redirect_uri=http%3A%2F%2F127.0.0.1:5173%2Fauth%2Fintra&response_type=code">LOGIN</a>
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
