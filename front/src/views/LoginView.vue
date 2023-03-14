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
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-center">Login with 42</v-card-title>
          <v-card-text>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block @click="login">LOGIN</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import {defineComponent} from "vue";
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";
import {ca} from "vuetify/locale";

interface ComponentData {
  username: string;
}

export default defineComponent({
  data(): ComponentData {
    return {
      username: "",
    };
  },
  created() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search.slice(1));
    const code = params.get("code");

    const token = localStorage.getItem("token");

    if (token && !code) {
      this.$router.push("/settings");
      return;
    }

    if (code) {
      (async () => {
        await this.sendRequest(code);
      })();
    }
  },
  methods: {
    async sendRequest(code: string) {
      try {
        const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/auth/intra?code=${code}`;
        const options = {
          method: 'GET',
        };
        const response = await fetch(input, options);
        if (response.ok) {
          let r = await response.json();
          const token = r.access_token;

          if (token) {
            localStorage.setItem("token", token);
            this.$router.push("/settings");
          }
        } else {
          console.log("error " + response.status);
        }
      } catch (error) {
        // console.log(error);
      }
    },
    async login(): Promise<any> {
      const url = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7e5b737845ac5cf17257544b648c6685597bd2e36775b1a00d087cd8dac23c55&redirect_uri=http%3A%2F%2F127.0.0.1%3A5173%2Flogin&response_type=code";
      window.location.href = url;
    },
    async registerUser(): Promise<void> {
      const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({login: this.username}),
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