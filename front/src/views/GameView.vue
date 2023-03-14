<template>
  <v-container fluid>
    <notification ref="notyf"/>
    <v-row>
      <v-col cols="12" md="6">
        <v-card color="primary">
          <v-card-text>
            <v-text-field v-model="nickname" label="Nickname"></v-text-field>
            <v-btn color="success darken-2" @click="showLevel = true">DUEL</v-btn>
            <v-dialog v-model="showLevel" max-width="500">
              <v-card>
                <v-card-title class="headline">Choose level</v-card-title>
                <v-card-text>
                  <v-radio-group v-model="selectedLevel" row>
                    <v-radio label="Easy" value="easy"></v-radio>
                    <v-radio label="Medium" value="medium"></v-radio>
                    <v-radio label="Hard" value="hard"></v-radio>
                  </v-radio-group>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" text @click="showLevel = false">Cancel</v-btn>
                  <v-btn color="green darken-1" text @click="createDuel(selectedLevel); showLevel = false">Duel</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-text>
        </v-card>
        <v-card color="grey-darken-3" v-for="duel in currentDuels" :key="duel.from" class="my-4">
          <v-card-title>From {{ duel.from }}</v-card-title>
          <v-card-actions>
            <v-btn color="green" @click="acceptDuel(duel.from)">ACCEPT</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card color="primary">
          <v-card-text>
            <v-btn color="success darken-2" @click="joinQueue">
              {{ onGame ? 'RESUME GAME' : 'JOIN QUEUE' }}
            </v-btn>
          </v-card-text>
        </v-card>
        <v-card color="grey-darken-3" v-for="game in currentGames" :key="game.uuid" class="my-4">
          <v-card-title>{{ game.firstNickname }} Vs. {{ game.secondNickname }}</v-card-title>
          <v-card-actions>
            <v-btn color="success darken-2" @click="spectate(game.uuid)">SPECTATE</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>


<script lang="ts">
import {defineComponent} from 'vue';
import {Duel} from "@/models/duel.model";
import {Game} from "@/models/game.model";
import {mapState} from "vuex";

export default defineComponent({
  data() {
    return {
      nickname: '',
      currentDuels: [] as Duel[],
      currentGames: [] as Game[],
      showLevel: false,
      selectedLevel: 'easy',
      snackbar: {
        show: false,
        message: '',
        timeout: 3000,
        color: 'error'
      }
    };
  },
  // beforeRouteLeave(to, from, next) {
  //   const socket = this.$store.getters.getPongSocket();
  //   socket.disconnect();
  //   next();
  // },
  created() {
    const socket = this.$store.getters.getPongSocket();
    socket.removeAllListeners();

    socket.emit('getDuels');
    socket.emit('getGames');

    socket.on('duels', (data: any) => {
      console.log('duels', data);
      this.currentDuels = data;
    });

    socket.on('onGame', (data: any) => {
      const isOnGame: boolean = data.onGame;
      this.$store.commit('setOnGame', isOnGame);
    });

    // const duels: Duel[] = [
    //   {
    //     from: 'test',
    //     expirationDate: new Date(),
    //   },
    //   {
    //     from: 'test2',
    //     expirationDate: new Date(),
    //   },
    //   {
    //     from: 'test3',
    //     expirationDate: new Date(),}
    // ];

    // this.currentDuels = duels;

    socket.on('games', (data: any) => {
      console.log('games', data);
      this.currentGames = data;
    });

    // const games: Game[] = [
    //   {
    //     uuid: 'test',
    //   },
    //   {
    //     uuid: 'test2',
    //   },
    //   {
    //     uuid: 'test3',
    //   }
    // ];
    //
    // this.currentGames = games;

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
  computed: {
    ...mapState({
      onGame: (state: any) => state.onGame,
    }),
  },
  methods: {
    createDuel(level: string) {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('createDuel', {
        login: this.nickname,
        gameLevel: level,
      });
    },
    acceptDuel(from: string) {
      const socket = this.$store.getters.getPongSocket();
      socket.emit('acceptDuel', {login: from});
    },
    joinQueue() {
      this.snackbar.message = 'Message de notification';
      this.snackbar.color = 'success';
      this.snackbar.show = true;
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


