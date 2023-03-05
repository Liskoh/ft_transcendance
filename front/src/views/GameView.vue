<template>
  <div>
    <input v-model="nickname" type="text" />
    <button @click="createDuel">DUEL</button>

    <div v-for="duel in currentDuels" :key="duel.from">
      <div>FROM {{duel.from}}</div>
      <button @click="acceptDuel(duel.from)">ACCEPT</button>
    </div>

    <button @click="joinQueue">JOIN QUEUE</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Duel } from "@/models/duel.model";

export default defineComponent({
  data() {
    return {
      nickname: '',
      currentDuels: [] as Duel[],
    };
  },
  created() {
    const socket = this.$store.getters.getPongSocket();

    socket.on('duels', (data: any) => {
      console.log('duels', data);
      this.currentDuels = data;
    });

    socket.on('startGame', (data: any) => {
      console.log('startGame', data);
      // window.location.href = 'http://127.0.0.1:5173/pong';
      // window.history.pushState(null, null, '/pong');
      this.$router.push('/pong');
    });

    socket.emit('getDuels');

    this.$forceUpdate;
  },
  methods: {
    createDuel() {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('createDuel', {
        login: this.nickname,
      });
      console.log('createDuel');
    },
    acceptDuel(from: string) {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('acceptDuel', { login: from });
    },
    joinQueue() {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('joinQueue');
    },
  },
  mounted() {},
});
</script>
