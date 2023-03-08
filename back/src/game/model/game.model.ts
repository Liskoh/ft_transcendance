import {Ball} from "./ball.model";
import {Player} from "./player.model";
import {DirectionState} from "../enum/direction-state.enum";
import {AppearanceState} from "../enum/appearance-state.enum";
import {BOARD_HEIGHT, BOARD_WIDTH, MAX_POINTS} from "../../consts";
import {GameState} from "../enum/game-state.enum";
import {GameLevel} from "../enum/game-level.enum";
import {getUserBySocket} from "../../utils";
import {Socket} from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import {MatchHistory} from "../entity/match-history.entity";
import {GameService} from "../service/game.service";


export class Game {

    constructor(firstPlayer: Player, secondPlayer: Player, ball: Ball, gameService: GameService) {
        this.uuid = uuidv4();
        this.ball = ball;
        this.firstPlayer = firstPlayer;
        this.secondPlayer = secondPlayer;
        this.spectators = [];
        this.gameService = gameService;
    }

    uuid: string;
    ball: Ball;
    firstPlayer: Player;
    secondPlayer: Player;
    gameState: GameState = GameState.NOT_STARTED;
    gameLevel: GameLevel;
    appearanceState: AppearanceState = AppearanceState.APPEAR;
    document: Document;
    spectators: Socket[];
    private readonly gameService: GameService;


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

        this.spectators.forEach(spectator => {
           if (spectator && spectator.connected) {
               spectator.emit(event, data);
               console.log('emit to spectator');
           }
        });
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

        this.emitToEveryone('resetPlace', {
            ball: {
                top: this.ball.coord.coord.top,
                left: this.ball.coord.coord.left
            },
            player: {
                top: this.firstPlayer.coord.coord.top,
            }
        });
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


    getPoint(playerWhoScore: any) : boolean {
        playerWhoScore.score++;
        this.emitToEveryone('updateScore', {
            id: playerWhoScore.id,
            score: playerWhoScore.score
        });
        this.emitToEveryone('newMessage', 'To continue press Enter');
        if (playerWhoScore.score === MAX_POINTS) {
            this.emitToEveryone('newMessage', 'Player ' + playerWhoScore.id.toString() + ' win the game');
            this.gameState = GameState.NOT_STARTED;
            return true;
        }

        this.gameState = GameState.PAUSED;
        this.ball.resetPlace();

        return false;
    }

    changeBallDirection(playerWhoHitTheBall: Player): void {
        const centerOfThePaddle = playerWhoHitTheBall.coord.coord.top + (playerWhoHitTheBall.size.height / 2);
        const centerOfTheBall = this.ball.coord.coord.top + (this.ball.size.height / 2);

        this.ball.directionY = Math.tan((centerOfTheBall - centerOfThePaddle) /
            (playerWhoHitTheBall.size.height / 2));

        if (playerWhoHitTheBall.id === this.firstPlayer.id) {
            // this.ball.coord.coord.left = playerWhoHitTheBall.coord.coord.right;
            this.ball.directionX = this.ball.speed + (Math.abs(this.ball.directionY) / 2);
        } else if (playerWhoHitTheBall.id === this.secondPlayer.id) {
            // this.ball.coord.coord.left = playerWhoHitTheBall.coord.coord.left - this.ball.size.width;
            this.ball.directionX = -this.ball.speed - (Math.abs(this.ball.directionY) / 2);
        }
    }

    moveBall(spectators: Socket[]): boolean {
        // if the ball touch the left or right of the boar
        if (this.ball.coord.coord.left <= 0) {
            this.getPoint(this.secondPlayer)
            return false;
        }
        if (this.ball.coord.coord.right >= BOARD_WIDTH) {
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
        if (this.ball.coord.coord.bottom >= BOARD_HEIGHT) {
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
        if (this.firstPlayer.keyPress['ArrowUp']) {
            this.firstPlayer.move(DirectionState.UP);
        }
        if (this.firstPlayer.keyPress['ArrowDown']) {
            this.firstPlayer.move(DirectionState.DOWN);
        }
        if (this.secondPlayer.keyPress['ArrowUp']) {
            this.secondPlayer.move(DirectionState.UP);
        }
        if (this.secondPlayer.keyPress['ArrowDown']) {
            this.secondPlayer.move(DirectionState.DOWN);
        }
    }

    moveAll(): void {
        let date = new Date();

        if (this.gameState === GameState.NOT_STARTED) {
            return;
        }
        if (this.firstPlayer === null || this.secondPlayer === null) {
            return;
        }

        if (date.getSeconds() % 2 === 0 && this.appearanceState === AppearanceState.APPEAR && this.gameLevel === GameLevel.HARD) {
            this.appearanceState = AppearanceState.DISAPPEAR;
            this.emitToEveryone('ballAppearance', {
                color: '#000000'
            });
        } else if (date.getSeconds() % 2 === 1 && this.appearanceState === AppearanceState.DISAPPEAR && this.gameLevel === GameLevel.HARD) {
            this.appearanceState = AppearanceState.APPEAR;
            this.emitToEveryone('ballAppearance', {
                color: '#ffffff'
            });
        }

        if (!this.moveBall(this.spectators))
            return;
        this.movePaddle();

        this.emitToEveryone('moveAll', {
            ball: {
                top: this.ball.coord.coord.top,
                left: this.ball.coord.coord.left
            },
            player1: {
                top: this.firstPlayer.coord.coord.top,
            },
            player2: {
                top: this.secondPlayer.coord.coord.top,
            }
        })

        setTimeout(this.moveAll.bind(this), 10);
    }

    // checkGameLevel() : void {
    //     if (this.gameLevel === GameLevel.EASY) {
    //         this.ball.speed /= 2;
    //     }
    // }

    startGame(): void {
        this.gameState = GameState.STARTED;
        this.emitToEveryone('newMessage', 'Game Started');
        // this.checkGameLevel();
        // this.gameLevel = GameLevel.HARD;
        this.resetGame();
        this.moveAll();

    }
}