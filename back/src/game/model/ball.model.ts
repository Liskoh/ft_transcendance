import {Coord} from "./coord.model";
import {Game} from "./game.model";
import {Player} from "./player.model";
import {Socket} from "socket.io";
import {AppearanceState} from "../enum/appearance-state.enum";
import {BOARD_HEIGHT, BOARD_WIDTH} from "../../consts";


export class Ball {
    speed: number;
    directionX: number;
    directionY: number;
    size: { width: number, height: number };
    coord: Coord;

    constructor(position: {
                    top: number,
                    left: number,
                    height: number,
                    width: number
                }) {
        this.speed = BOARD_HEIGHT * 0.5 / 100;
        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;
        this.size = {
            width: position.width,
            height: position.height
        };
        this.coord = new Coord(position, this.size);
    }

    getNewPosition() {
        this.coord.coord.bottom = this.coord.coord.top + this.size.height;
        this.coord.coord.right = this.coord.coord.left + this.size.width;
    }

    // Function to move the paddle on the board, and sending to everyone the new position
    move() {
        this.coord.coord.top += this.directionY * this.speed;
        this.coord.coord.left += this.directionX * this.speed;

        this.getNewPosition();
    }

    // Function to reset the place of the paddle in the board
    resetPlace() {
        this.coord.coord.top = BOARD_HEIGHT / 2 - this.size.height / 2
        this.coord.coord.left = BOARD_WIDTH / 2 - this.size.width / 2;
        this.getNewPosition();

        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;
    }
}