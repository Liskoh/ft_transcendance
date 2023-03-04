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
    <h1 id="'player_1_score'" class="player_1_score">0</h1>
    <h1 id="'player_2_score'" class="player_2_score">0</h1>
    <h1 id="message" class="message">"Press Enter to Play Pong"</h1>
  </div>
</template>

<script lang="ts">

import io, {Socket} from "socket.io-client";
import { store } from "@/stores/store";

export default {
  name: 'PongView',
  store,

  created() {
    console.log('created token ' + localStorage.getItem('token'));
    this.$store.commit('setPongSocket', io('http://10.13.8.3:8000/game', {
      extraHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }));

    // this.getPongSocket.emit('playerJoin');
  },

  beforeRouteLeave(to, from, next) {
    console.log('beforeRouteLeave pong view');
    const socket : Socket = this.getPongSocket;

    if (!socket) {
      console.log('socket is null');
    } else {
      console.log('socket is not null');
      this.getPongSocket.disconnect();
    }
    next();
  },
  computed: {
    getPongSocket() {
      return this.$store.getters.getPongSocket;
    },

    mounted() {
      this.getPongSocket.on('nbrPlayer', (data) => {
        const nbrPlayer: number = data.nbrPlayer;

        if (nbrPlayer === 1) {
          console.log('You are player 1');
          this.getPongSocket().emit('playerJoin', {
            ballPosition: ballDoc.getBoundingClientRect(),
            position: paddle1.getBoundingClientRect(),
            id: 1,
            board: board.getBoundingClientRect()
          });
        } else if (nbrPlayer === 2) {
          console.log('You are player 2');
          this.getPongSocket().emit('playerJoin', {
            ballPosition: ballDoc.getBoundingClientRect(),
            position: paddle2.getBoundingClientRect(),
            id: 2,
            board: board.getBoundingClientRect()
          });
        } else {
          imSpectator = true;
          console.log('Spectator');
          this.getPongSocket().emit('player_join', {id: nbrPlayer});
        }
      });

      this.getPongSocket.on('startGame', () => {
        message.innerHTML = 'Game Start';
        player1.scoreDoc.innerHTML = '0';
        player2.scoreDoc.innerHTML = '0';
      });

      this.getPongSocket.on('resetBall', (data) => {
        ball.resetPlace(data.top, data.left);
      });

      this.getPongSocket.on('resetPaddle', (data) => {
        player1.resetPlace(data);
        player2.resetPlace(data);
      });

      this.getPongSocket.on('moveBall', (data) => {
        ball.move(data.top, data.left);
      });

      this.getPongSocket.on('movePaddle', (data) => {
        if (data.id === 1) {
          player1.move(data.top);
        } else if (data.id === 2) {
          player2.move(data.top);
        }
      });

      this.getPongSocket.on('updateScore', (data) => {
        if (data.id === 1) {
          player1.scoreDoc.innerHTML = '' + data.score;
        } else if (data.id === 2) {
          player2.scoreDoc.innerHTML = '' + data.score;
        }
      });
      this.getPongSocket.on('someoneWin', (data) => {
        if (data.id === 1) {
          message.innerHTML = 'Player 1 Win';
        } else if (data.id === 2) {
          message.innerHTML = 'Player 2 Win';
        }
      });
    }
  },

  //emit socket
  methods: {
    keyDownEvent(event: any) {
      console.log('keyDownEvent');
      if (imSpectator) {
        return ;
      }
      this.getPongSocket.emit('onKeyInput', {
        key: event.key,
        pressed: true,
      });
    },

    keyUpEvent(event: any) {
      if (imSpectator) {
        return ;
      }
      this.getPongSocket.emit('onKeyInput', {
        key: event.key,
        pressed: false,
      });
    }
  },
}

let imSpectator: boolean = false;
let message: HTMLElement = document.getElementById('message');
let ballDoc: HTMLElement = document.getElementById('ball');
let paddle1: HTMLElement = document.getElementById('paddle1');
let paddle2: HTMLElement = document.getElementById('paddle2');
let board: HTMLElement = document.getElementById('board');

document.addEventListener('keydown', keyDownEvent);
document.addEventListener('keyup', keyUpEvent);

class Player {
  scoreDoc: HTMLElement;
  paddleDoc: HTMLElement;

  constructor(score, paddle) {
    this.scoreDoc = document.getElementById(score);
    this.paddleDoc = document.getElementById(paddle);
  }

  move(top: number) {
    this.paddleDoc.style.top = top + "%";
  }

  resetPlace(top: number) {
    this.paddleDoc.style.top = top + "%";
  }
}

class Ball {
  ballDoc: HTMLElement;

  constructor() {
    this.ballDoc = document.getElementById('ball');
  }

  move(top: number, left: number) {
    this.ballDoc.style.top = top + "%";
    this.ballDoc.style.left = left + "%";
  }

  resetPlace(top: number, left: number) {
    this.ballDoc.style.top = top + "%";
    this.ballDoc.style.left = left + "%";
  }
}

let player1 = new Player("player_1_score", "paddle1");
let player2 = new Player("player_2_score", "paddle2");
let ball = new Ball();

document.addEventListener('keydown', keyDownEvent);
document.addEventListener('keyup', keyUpEvent);

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
</style>
