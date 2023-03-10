<template>
  <v-container fluid fill-height>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-center">Register</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field v-model="username" label="Username"></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block @click="registerUser">Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { VUE_APP_BACK_PORT, VUE_APP_WEB_HOST } from "@/consts";

interface ComponentData {
  username: string;
}

export default defineComponent({
  data(): ComponentData {
    return {
      username: "",
    };
  },
  methods: {
    async registerUser(): Promise<void> {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: this.username }),
      };
      const input: string = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/auth/register`;
      try {
        const register = await fetch(input, requestOptions);
        const dataRegister = await register.json();

        if (dataRegister.status === 200) {
          localStorage.setItem("token", dataRegister.access_token);
          this.$router.push("/settings");
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
});

</script>
<style>
.v-card__title {
  background-color: #3f51b5;
  color: white;
}
.v-card {
  background-color: white;
}
.v-form {
  margin-top: 16px;
}
</style>