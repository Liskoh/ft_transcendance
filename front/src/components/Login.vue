<template>
  <div>
    <label>Username:</label>
    <input type="text" v-model="username">
    <button @click="registerUser">Register</button>
  </div>
</template>

<script lang="ts">
import { HttpStatusCode } from "axios";

interface ComponentData {
  username: string;
  registerUser(): Promise<void>;
}

export default {
  data(): ComponentData {
    return {
      username: "",
      async registerUser() {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: this.username }),
        };

        try {
          const register = await fetch(
              "http://10.13.8.3:8000/auth/register",
              requestOptions
          );
          const dataRegister = await register.json();

          if (dataRegister.status === HttpStatusCode.Ok) {
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
