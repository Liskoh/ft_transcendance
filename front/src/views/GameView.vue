<template>
  <div>
    <notification ref="notyf" />
  </div>

  <div class="body">
  <div class="table">
    <div class="column divGame">

      <div class="row duel">
        <input class="duelInput" v-model="nickname" type="text" />
        <button class="duelButton" @click="createDuel">DUEL</button>
      </div>

      <div class="duelList" v-for="duel in currentDuels" :key="duel.from">
        <div>FROM {{duel.from}}</div>
        <button class="acceptButton" @click="acceptDuel(duel.from)">ACCEPT</button>
      </div>

    </div>

    <div class="column queue">

      <button class="queueButton" @click="joinQueue">JOIN QUEUE</button>

      <div class="queueList" v-for="game in currentGames" :key="game.uuid">
        <div>UUID {{game.uuid}}</div>
        <button class="spectateButton" @click="spectate(game.uuid)">SPECTATE</button>
      </div>

    </div>
  </div>

<!--    &#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; DUELS &#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->

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

.body {
  display: table;
  text-align: center;
  width: 100%;
  height: 100%;
}

.column {
  position: absolute;
  display: table-cell;
  vertical-align: middle;
  margin: auto;
  width: 50%;
}

.column.divGame {
  /*width: 50%;*/
  text-align: center;
  margin: 0 auto;
}

.column.queue {
  /*width: 50%;*/
  text-align: center;
  left: 50%;
  margin: 0 auto;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.duelInput {
  flex: 1;
  margin-right: 10px;
}

.duelButton {
  flex: 0;
}

.duelList {
  padding: 10px;
}

.queueButton {
  margin-top: 10px;
}

.queueList {
  padding: 10px;
}


</style>