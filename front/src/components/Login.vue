<template>
  <div>
    <label>Username:</label>
    <input type="text" v-model="username">
    <button @click="registerUser">Register</button>
  </div>
</template>

<script lang="ts">
import axios, { AxiosError, AxiosResponse } from "axios";
import { VUE_APP_BACK_PORT, VUE_APP_WEB_HOST } from "@/consts";

interface ComponentData {
  username: string;
}

export default {
  mounted() {
    console.log(VUE_APP_WEB_HOST);
    console.log('test');
  },
  data(): ComponentData {
    return {
      username: "",
    };
  },
  methods: {
    async registerUser(): Promise<void> {
      try {
        const response: AxiosResponse = await axios.post(
            `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/auth/register`,
            { login: this.username },
            {
              headers: { "Content-Type": "application/json" },
            }
        );

        if (response.status === 200) {
          console.log("success");
          localStorage.setItem("token", response.data.access_token);
          return;
        }
      } catch (error: AxiosError) {
        console.log(error);
      }
    },
  },
};
</script>
