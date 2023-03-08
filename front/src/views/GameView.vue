<template>
  <div>
    <notification ref="notyf" />
  </div>

  <div>
    <input v-model="nickname" type="text" />
    <button @click="createDuel">DUEL</button>

<!--    &#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; DUELS &#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
    <div v-for="duel in currentDuels" :key="duel.from">
      <div>FROM {{duel.from}}</div>
      <button @click="acceptDuel(duel.from)">ACCEPT</button>
    </div>

    <div v-for="game in currentGames" :key="game.uuid">
      <div>UUID {{game.uuid}}</div>
      <button @click="spectate(game.uuid)">SPECATE</button>
    </div>

    <button @click="joinQueue">JOIN QUEUE</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Duel } from "@/models/duel.model";
import {Game} from "@/models/game.model";

export default defineComponent({
  data() {
    return {
      nickname: '',
      currentDuels: [] as Duel[],
      currentGames: [] as Game[],
    };
  },
  // beforeRouteLeave(to, from, next) {
  //   const socket = this.$store.getters.getPongSocket();
  //   socket.disconnect();
  //   next();
  // },
  created() {
    const socket = this.$store.getters.getPongSocket();

    if (!socket) {
      this.$router.push('/');
      return;
    }

    socket.emit('getDuels');
    socket.emit('getGames');

    socket.on('duels', (data: any) => {
      console.log('duels', data);
      this.currentDuels = data;
    });

    socket.on('games', (data: any) => {
      console.log('games', data);
      this.currentGames = data;
    });

    socket.on('sendOnPong', (data: any) => {
      console.log('sendOnPong', data);
      // window.location.href = 'http://127.0.0.1:5173/pong';
      // window.history.pushState(null, null, '/pong');
      this.$router.push('/pong');
    });

    socket.on('endGame', (data: any) => {
      this.$router.push('/game');
    });

  },
  methods: {
    createDuel() {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('createDuel', {
        login: this.nickname,
      });
    },
    acceptDuel(from: string) {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('acceptDuel', { login: from });
    },
    joinQueue() {
      this.$refs.notyf.showNotification('Message de notification', 'success');
      const socket = this.$store.getters.getPongSocket();
      socket.emit('joinQueue');
      console.log('joinQueue');
    },
    spectate(uuid: string) {
      const socket = this.$store.getters.getPongSocket();
      console.log('spectate ', uuid);
      socket.emit('spectate', {
        uuid: uuid,
      });
    },
  },
  // mounted() {
  //   const socket = this.$store.getters.getPongSocket();
  //   socket.emit('getDuels');
  //   socket.emit('getGames');
  // },
});
</script>


<style>



</style>