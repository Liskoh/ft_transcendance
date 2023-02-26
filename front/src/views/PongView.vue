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
import {SOCKET_SERVER} from "@/consts";


let imSpectator: boolean = false;
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

function keyDownEvent(event) {
  if (imSpectator) {
    return;
  }
  SOCKET_SERVER.emit('keyDown', event.key);
}

function keyUpEvent(event) {
  if (imSpectator) {
    return;
  }
  SOCKET_SERVER.emit('keyUp', event.key);
}

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
