import {Ball} from "./ball.model";
import {Player} from "./player.model";
import {DirectionState} from "../enum/direction-state.enum";
import {MAX_POINTS} from "../../consts";
import {GameState} from "../enum/game-state.enum";
import {GameLevel} from "../enum/game-level.enum";

export class Game {

    constructor(firstPlayer: Player, secondPlayer: Player, ball: Ball) {
        this.ball = ball;
        this.firstPlayer = firstPlayer;
        this.secondPlayer = secondPlayer;
    }
    ball: Ball;
    firstPlayer: Player;
    secondPlayer: Player;
    gameState: GameState;
    gameLevel: GameLevel;
    document: Document;

    invitations: string[] = [];

    isPrivate: boolean;

    resetGame() {
        console.log('reset');
        this.firstPlayer.score = 0;
        this.secondPlayer.score = 0;
        // emitToEveryone('updateScore', {id: player1.id, score: player1.score});
        // emitToEveryone('updateScore', {id: player2.id, score: player2.score});
        // firstPlayer.resetPlace();
        // secondPlayer.resetPlace();
        // ball.resetPlace();
    }

    getPoint(playerWhoScore) : boolean {
        playerWhoScore.score++;
        //TODO: SOCKET GATEWAY
        // emitToEveryone('updateScore', {id: playerWhoScore.id, score: playerWhoScore.score});
        if (playerWhoScore.score === MAX_POINTS ) {
            // emitToEveryone('someoneWin', playerWhoScore.id);
            this.gameState = GameState.NOT_STARTED;
            return false;
        }

        this.ball.resetPlace();
        return true;
    }

    changeBallDirection(playerWhoHitTheBall: Player) : void {
        this.ball.directionY = Math.tan((this.ball.coord.coordCenter.y - playerWhoHitTheBall.coord.coordCenter.y) /
            (playerWhoHitTheBall.size.height / 2)) * 1.5;

        if (playerWhoHitTheBall.id === this.firstPlayer.id)
            this.ball.directionX = this.ball.speed + (Math.abs(this.ball.directionY) / 2);
        else if (playerWhoHitTheBall.id === this.secondPlayer.id)
            this.ball.directionX = -this.ball.speed - (Math.abs(this.ball.directionY) / 2);
    }

    moveBall() : boolean {
        // if the ball touch the left or right of the board
        if (this.ball.coord.coord.left <= 0) {
            if (this.getPoint(this.secondPlayer))
                return false;
        }
        if (this.ball.coord.coord.right >= 100) {
            if (this.getPoint(this.firstPlayer))
                return false;
        }

        // if the ball touch the left or right paddle
        if (this.ball.coord.coord.left <= this.firstPlayer.coord.coord.right
            && this.ball.coord.coord.bottom >= this.firstPlayer.coord.coord.top
            && this.ball.coord.coord.top <= this.firstPlayer.coord.coord.bottom
            && this.ball.coord.coord.left >= this.firstPlayer.coord.coord.left) {
            this.changeBallDirection(this.firstPlayer);
        }
        if (this.ball.coord.coord.right >= this.secondPlayer.coord.coord.left
            && this.ball.coord.coord.bottom >= this.secondPlayer.coord.coord.top
            && this.ball.coord.coord.top <= this.secondPlayer.coord.coord.bottom
            && this.ball.coord.coord.right <= this.secondPlayer.coord.coord.right) {
            this.changeBallDirection(this.secondPlayer);
        }

        // if the ball touch the top or bottom of the board
        if (this.ball.coord.coord.top <= 0) {
            this.ball.directionY = -this.ball.directionY;
        }
        if (this.ball.coord.coord.bottom >= 100) {
            this.ball.directionY = -this.ball.directionY;
        }

        // if the ball the top or bottom of the paddle
        if ((this.ball.coord.coord.top == this.firstPlayer.coord.coord.bottom
                || this.ball.coord.coord.bottom == this.firstPlayer.coord.coord.top)
            && this.ball.coord.coord.left <= this.firstPlayer.coord.coord.right
            && this.ball.coord.coord.right >= this.firstPlayer.coord.coord.left) {
            this.ball.directionY = -this.ball.directionY;
        }
        if ((this.ball.coord.coord.bottom == this.secondPlayer.coord.coord.top
                || this.ball.coord.coord.top == this.secondPlayer.coord.coord.bottom)
            && this.ball.coord.coord.left <= this.secondPlayer.coord.coord.right
            && this.ball.coord.coord.right >= this.secondPlayer.coord.coord.left) {
            this.ball.directionY = -this.ball.directionY;
        }

        this.ball.move();
    }

    movePaddle() : void {
        if (this.firstPlayer.keyPress['w']) {
            this.firstPlayer.move(DirectionState.UP);
            //emitToEveryone('movePaddle', {top: this.firstPlayer.coord.coord.top, id: this.firstPlayer.id});
        }
        if (this.firstPlayer.keyPress['s']) {
            this.firstPlayer.move(DirectionState.DOWN);
            // emitToEveryone('movePaddle', {top: this.firstPlayer.coord.coord.top, id: this.firstPlayer.id});
        }
        if (this.secondPlayer.keyPress['ArrowUp']) {
            this.secondPlayer.move(DirectionState.UP);
            // emitToEveryone('movePaddle', {top: this.secondPlayer.coord.coord.top, id: this.secondPlayer.id});
        }
        if (this.secondPlayer.keyPress['ArrowDown']) {
            this.secondPlayer.move(DirectionState.DOWN);
            // emitToEveryone('movePaddle', {top: this.secondPlayer.coord.coord.top, id: this.secondPlayer.id});
        }
    }

    moveAll() : void {
        if (this.gameState === GameState.NOT_STARTED) {
            return;
        }
        if (this.firstPlayer === null || this.secondPlayer === null) {
            return;
        }
        if (!this.moveBall())
            return ;
        this.movePaddle();
        setTimeout(this.moveAll, 10);
    }

    checkGameLevel() : void {
        if (this.gameLevel === GameLevel.EASY) {
            this.ball.speed -= 0.3;
        } else if (this.gameLevel === GameLevel.HARD) {
            // find the way to access to the html page
        }
    }

    startGame() : void {
        this.checkGameLevel();
        this.moveAll();
    }
}