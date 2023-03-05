import {Ball} from "./ball.model";
import {Player} from "./player.model";
import {DirectionState} from "../enum/direction-state.enum";
import {MAX_POINTS} from "../../consts";
import {GameState} from "../enum/game-state.enum";
import {GameLevel} from "../enum/game-level.enum";
import {getUserBySocket} from "../../utils";

export class Game {

    constructor(firstPlayer: Player, secondPlayer: Player, ball: Ball) {
        this.ball = ball;
        this.firstPlayer = firstPlayer;
        this.secondPlayer = secondPlayer;
    }

    ball: Ball;
    firstPlayer: Player;
    secondPlayer: Player;
    gameState: GameState = GameState.NOT_STARTED;
    gameLevel: GameLevel;
    document: Document;


    emitToEveryone(event: string, data?: any) {
        try {
            this.firstPlayer.client.emit(event, data);
        } catch (error) {
            console.log('try to emit to a player but he is not connected');
        }try {
            this.secondPlayer.client.emit(event, data);
        } catch (error) {
            console.log('try to emit to a player but he is not connected');
        }
    }

    getPlayer(id: string): Player {
        if (this.firstPlayer.id === id) {
            return this.firstPlayer;
        }
        if (this.secondPlayer.id === id) {
            return this.secondPlayer;
        }
        return null;
    }

    resetAllPlace() {
        this.firstPlayer.resetPlace();
        this.secondPlayer.resetPlace();
        this.ball.resetPlace();
    }

    resetGame() {
        console.log('reset');
        this.firstPlayer.score = 0;
        this.secondPlayer.score = 0;
        this.emitToEveryone('updateScore', {
            id: this.firstPlayer.id,
            score: this.firstPlayer.score.toString()
        });
        this.emitToEveryone('updateScore', {
            id: this.secondPlayer.id,
            score: this.secondPlayer.score.toString()
        });
        this.resetAllPlace();
    }

    getPoint(playerWhoScore) {
        playerWhoScore.score++;
        this.emitToEveryone('updateScore', {
            id: playerWhoScore.id,
            score: playerWhoScore.score
        });
        this.emitToEveryone('newMessage', 'To continue press Enter');
        if (playerWhoScore.score === MAX_POINTS) {
            this.emitToEveryone('newMessage', 'Player ' + playerWhoScore.id.toString() + ' win the game');
            this.gameState = GameState.NOT_STARTED;
            return ;
        }

        this.gameState = GameState.PAUSED;
        this.ball.resetPlace();
    }

    changeBallDirection(playerWhoHitTheBall: Player): void {
        this.ball.directionY = Math.tan((this.ball.coord.coordCenter.y - playerWhoHitTheBall.coord.coordCenter.y) /
            (playerWhoHitTheBall.size.height / 2)) * 1.5;

        if (playerWhoHitTheBall.id === this.firstPlayer.id)
            this.ball.directionX = this.ball.speed + (Math.abs(this.ball.directionY) / 2);
        else if (playerWhoHitTheBall.id === this.secondPlayer.id)
            this.ball.directionX = -this.ball.speed - (Math.abs(this.ball.directionY) / 2);
    }

    private num = 0;

    moveBall(): boolean {
        // if the ball touch the left or right of the boar
        if (this.ball.coord.coord.left <= 0) {
            this.getPoint(this.secondPlayer)
            return false;
        }
        if (this.ball.coord.coord.right >= 100) {
            this.getPoint(this.firstPlayer)
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
        return true;
    }

    movePaddle(): void {
        // console.log('move paddle');
        if (this.firstPlayer.keyPress['ArrowUp']) {
            this.firstPlayer.move(DirectionState.UP);
            this.emitToEveryone('movePaddle', {
                top: this.firstPlayer.coord.coord.top,
                id: this.firstPlayer.id
            });
        }
        if (this.firstPlayer.keyPress['ArrowDown']) {
            this.firstPlayer.move(DirectionState.DOWN);
            this.emitToEveryone('movePaddle', {
                top: this.firstPlayer.coord.coord.top,
                id: this.firstPlayer.id
            });
        }
        if (this.secondPlayer.keyPress['ArrowUp']) {
            this.secondPlayer.move(DirectionState.UP);
            this.emitToEveryone('movePaddle', {
                top: this.secondPlayer.coord.coord.top,
                id: this.secondPlayer.id
            });
        }
        if (this.secondPlayer.keyPress['ArrowDown']) {
            this.secondPlayer.move(DirectionState.DOWN);
            this.emitToEveryone('movePaddle', {
                top: this.secondPlayer.coord.coord.top,
                id: this.secondPlayer.id
            });
        }
    }

    private i: number = 0;

    moveAll(): void {
        this.i++;

        if (this.i % 20 === 0) {
            console.log('move all ' + this.i);

            console.log('first player ' + this.firstPlayer.client.id);
            console.log('second player ' + this.secondPlayer.client.id);

            this.emitToEveryone('newMessage', 'hfydstfusdgfasfdas ' + this.i);
        }
        // if (this.gameState === GameState.NOT_STARTED) {
        //     return;
        // }
        if (this.firstPlayer === null || this.secondPlayer === null) {
            return;
        }
        if (!this.moveBall())
            return;
        this.movePaddle();
        setTimeout(this.moveAll.bind(this), 10);
    }

    // checkGameLevel() : void {
    //     if (this.gameLevel === GameLevel.EASY) {
    //         this.ball.speed -= 0.3;
    //     } else if (this.gameLevel === GameLevel.HARD) {
    //         // find the way to access to the html page
    //     }
    // }

    startGame(): void {
        this.gameState = GameState.STARTED;
        this.emitToEveryone('newMessage', 'Game Started');
        // this.checkGameLevel();
        this.resetGame();
        this.moveAll();
    }
}