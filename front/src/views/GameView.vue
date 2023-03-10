<template>
  <v-container fluid>
    <notification ref="notyf" />
    <v-row>
      <v-col cols="12" md="6">
        <v-card color="primary">
          <v-card-text>
            <v-text-field v-model="nickname" label="Nickname"></v-text-field>
            <v-btn color="success darken-2" @click="createDuel">DUEL</v-btn>
          </v-card-text>
        </v-card>
        <v-card color="primary" v-for="duel in currentDuels" :key="duel.from" class="my-4">
          <v-card-title>FROM {{duel.from}}</v-card-title>
          <v-card-actions>
            <v-btn color="warning darken-2" @click="acceptDuel(duel.from)">ACCEPT</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card color="primary">
          <v-card-text>
            <v-btn color="success darken-2" @click="joinQueue">JOIN QUEUE</v-btn>
          </v-card-text>
        </v-card>
        <v-card color="primary" v-for="game in currentGames" :key="game.uuid" class="my-4">
          <v-card-title>hjordan VS test</v-card-title>
          <v-card-actions>
            <v-btn color="success darken-2" @click="spectate(game.uuid)">SPECTATE</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>




<script lang="ts">
import { defineComponent } from 'vue';
import { Duel } from "@/models/duel.model";
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

    socket.emit('getDuels');
    socket.emit('getGames');

    // socket.on('duels', (data: any) => {
    //   console.log('duels', data);
    //   this.currentDuels = data;
    // });

    const duels: Duel[] = [
      {
        from: 'test',
        expirationDate: new Date(),
      },
      {
        from: 'test2',
        expirationDate: new Date(),
      },
      {
        from: 'test3',
        expirationDate: new Date(),}
    ];

    this.currentDuels = duels;

    // socket.on('games', (data: any) => {
    //   console.log('games', data);
    //   this.currentGames = data;
    // });

    const games: Game[] = [
      {
        uuid: 'test',
      },
      {
        uuid: 'test2',
      },
      {
        uuid: 'test3',
      }
    ];

    this.currentGames = games;

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


