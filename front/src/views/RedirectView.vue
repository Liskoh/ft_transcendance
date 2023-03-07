<template>
  <div class="redirect">
    <h1>Successfully redirected</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .redirect {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

<script lang="ts">
import axios from 'axios';
import { HttpStatusCode } from "axios";

export default {
  created() {
    this.connectIntra();
  },
  methods: {
    async connectIntra() {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search.slice(1));
      const code = params.get('code');
      if (!code) {
        console.error('No code found in URL');
        return;
      }

	  console.log(code);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/auth/intra?code=${code}`);
        console.log(response.data.access_token);
      } catch (error) {
        console.error(error);
      }
    }
  }
}


</script>
