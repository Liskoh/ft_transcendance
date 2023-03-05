<template>
  <div>
    <input v-model="nickname" type="text" />
    <button @click="createDuel">DUEL</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      nickname: ''
    };
  },
  methods: {
    createDuel() {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('createDuel', {
        login: this.nickname,
      });
      this.nickname = '';
    },
  },
  beforeRouteLeave(to, from, next) {
    const socket = this.$store.getters.getPongSocket();
    socket.disconnect();
    next();
  },
});
</script>
