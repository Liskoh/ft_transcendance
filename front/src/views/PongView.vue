<script setup lang="ts">
import PageLoad from '@/components/PageLoad.vue';
</script>

<template>
  <div id="board" class="board">
    <div id="ball" class="ball">
      <div class="ball_effect"></div>
    </div>
    <div id="paddle1" class="paddle_1 paddle"></div>
    <div id="paddle2" class="paddle_2 paddle"></div>
    <h1 id="player1Score" class="player_1_score">0</h1>
    <h1 id="player2Score" class="player_2_score">0</h1>
    <h1 id="message" class="message">"Press Enter to Play Pong"</h1>
  </div>
</template>

<script lang="ts">
import {Player} from "@/views/models/player.model";
import {Ball} from "@/views/models/ball.model";
import io, {Socket} from "socket.io-client";
import {store} from "@/stores/store";
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";

export default {
  name: 'PongView',
  store,

  data() {
    return {
      imSpectator: false,
      message: null,
      ballDoc: null,
      paddle1: null,
      paddle2: null,
      board: null,
      player1: null,
      player2: null,
      player1Score: null,
      player2Score: null,
      ball: null,
    }
  },

  // setup() {
  //   const notyf: Notyf = new Notyf({
  //     duration: 2500,
  //     position: {
  //       x: 'right',
  //       y: 'top'
  //     }
  //   });
  //
  //   const showNotification = (message: string, type: 'success' | 'error'): void => {
  //     if (type === 'success') {
  //       notyf.success(message);
  //     } else {
  //       notyf.error(message);
  //     }
  //   };
  //
  //   return {
  //     showNotification
  //   }
  // },

  created() {
    document.addEventListener('keydown', this.keyDownEvent);
    document.addEventListener('keyup', this.keyUpEvent);
  },

  // beforeRouteLeave(to, from, next) {
  //   // console.log('beforeRouteLeave');
  //   // document.removeEventListener('keydown', this.keyDownEvent);
  //   // document.removeEventListener('keyup', this.keyUpEvent);
  //   // console.log('beforeRouteLeave2');
  //   // this.getPongSocket.disconnect();
  //   next();
  // },

  computed: {
    // getPongSocket() {
    //   return this.$store.getters.getPongSocket;
    // },
  },

  mounted() {
    // console.log('created token ' + localStorage.getItem('token'));
    this.$store.commit('setPongSocket', io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/game', {
      extraHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }));

    const socket: Socket = this.$store.getters.getPongSocket();

    socket.emit('joinGame', {game: 'pong'});
    console.log('dasdasd token ' + localStorage.getItem('token'));


    this.message = document.getElementById('message');
    this.ballDoc = document.getElementById('ball');
    this.paddle1 = document.getElementById('paddle1');
    this.paddle2 = document.getElementById('paddle2');
    this.board = document.getElementById('board');
    this.player1Score = document.getElementById('player1Score');
    this.player2Score = document.getElementById('player2Score');
    this.player1 = new Player(document, "player1Score", "paddle1");
    this.player2 = new Player(document, "player2Score", "paddle2");
    this.ball = new Ball(document);


    // socket.on('gameError', (data) => {
    //   console.log('gameError');
    //   this.showNotification(data, 'error');
    // });
    //
    // socket.on('gameSuccess', (data) => {
    //   this.showNotification(data, 'success');
    // });

    socket.on('nbrPlayer', (data) => {
      const nbrPlayer: number = data.nbrPlayer;

      if (nbrPlayer === 1) {
        console.log('You are player 1');
        // socket.emit('playerJoin', {
        //   ballPosition: this.ballDoc.getBoundingClientRect(),
        //   position: this.paddle1.getBoundingClientRect(),
        //   id: 1,
        //   board: this.board.getBoundingClientRect()
        // });
      } else if (nbrPlayer === 2) {
        console.log('You are player 2');
        // socket.emit('playerJoin', {
        //   ballPosition: this.ballDoc.getBoundingClientRect(),
        //   position: this.paddle2.getBoundingClientRect(),
        //   id: 2,
        //   board: this.board.getBoundingClientRect()
        // });
      } else {
        this.imSpectator = true;
        console.log('Spectator');
        // socket.emit('player_join', {id: nbrPlayer});
      }
    });

    socket.on('startGame', () => {
      this.message.innerHTML = 'Game Start';
      this.player1Score.innerHTML = '0';
      this.player2Score.innerHTML = '0';
    });

    socket.on('resetBall', (data) => {
      this.ball.resetPlace(data.top, data.left);
    });

    socket.on('resetPaddle', (data) => {
      this.player1.resetPlace(data);
      this.player2.resetPlace(data);
    });

    socket.on('moveBall', (data) => {
      this.ball.move(data.top, data.left);
    });

    socket.on('movePaddle', (data) => {
      console.log('movePaddle ' + data.id + ' ' + data.top);
      if (data.id == 1) {
        console.log('movePaddle1')
        this.player1.move(data.top);
      } else if (data.id == 2) {
        console.log('movePaddle2')
        this.player2.move(data.top);
      }
    });

    socket.on('updateScore', (data) => {
      if (data.id == 1) {
        this.player1Score.innerHTML = data.score;
      } else if (data.id == 2) {
        this.player2Score.innerHTML = data.score;
      }
    });

    socket.on('newMessage', (data) => {
      this.message.innerHTML = data;
      console.log('newMessage ' + data);
    });
  },

  methods: {
    keyDownEvent(event: any) {
      if (this.imSpectator) {
        return;
      }
      const socket: Socket = this.$store.getters.getPongSocket();
      socket.emit('onKeyInput', {
        key: event.key,
        pressed: true,
      });
    },

    keyUpEvent(event: any) {
      if (this.imSpectator) {
        return;
      }
      const socket: Socket = this.$store.getters.getPongSocket();
      socket.emit('onKeyInput', {
        key: event.key,
        pressed: false,
      });
    }
  },
};

</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  height: 100vh;
  width: 100vw;
  background: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.board {
  position: relative;
  height: 85vh;
  width: 80vw;
  background: #000000;
  border: solid 5px #ffffff;
  border-radius: 2px;
}

/*//cente*/
/*.board {*/
/*  position: absolute;*/
/*  top: 50%;*/
/*  left: 50%;*/
/*  transform: translate(-50%, -50%);*/
/*  height: 85vh;*/
/*  width: 80vw;*/
/*  background: #000000;*/
/*  border: solid 5px #ffffff;*/
/*  border-radius: 2px;*/
/*}*/

.ball {
  position: absolute;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  top: calc(50% - 15px);
  left: calc(50% - 15px);
}

.ball_effect {
  height: 100%;
  width: 100%;
  border-radius: 100px;
  background: #ffffff;
  /*animation: spinBall 0.1s linear infinite;*/
}

/*@keyframes spinBall {*/
/*    100% {*/
/*        -webkit-transform: rotate(360deg);*/
/*        transform: rotate(360deg);*/
/*    }*/
/*}*/

.paddle {
  position: absolute;
  height: 20vh;
  width: 1.5vw;
  top: calc(50% - 10vh);
  border-radius: 2px;
  background: #ffffff;
}

.paddle_1 {
  left: 2vw;
}

.paddle_2 {
  right: 2vw;
}

.player_1_score {
  height: 50px;
  width: 50px;
  color: #717171;
  position: absolute;
  left: 30vw;
  margin-top: 30px;
}

.player_2_score {
  height: 50px;
  width: 50px;
  color: #717171;
  position: absolute;
  left: 70vw;
  margin-top: 30px;
}

.message {
  position: absolute;
  height: 10vh;
  width: 30vw;
  color: #ffffff;
  left: 38vw;
  margin: 30px auto auto auto;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}

/*@media (min-width: 1024px) {*/
/*  .about {*/
/*    min-height: 100vh;*/
/*    display: flex;*/
/*    justify-content: center;*/
/*    align-items: center;*/
/*  }*/
/*}*/
</style>
