import {Coord} from "./coord.model";

export class Ball {
    speed: number;
    directionX: number;
    directionY: number;
    size: { width: number, height: number };
    coord: Coord;

    constructor(position: { top: number, left: number, height: number, width: number }, board: { top: number, left: number, height: number, width: number }) {
        this.speed = 0.5;
        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;
        this.size = {
            width: (position.width / board.width) * 100,
            height: (position.height / board.height) * 100
        };
        this.coord = new Coord(position, this.size, board);
    }

    // Calcul coord of the new position of the paddle
    getNewPosition() {
        this.coord.coord.top = this.coord.coordCenter.y - this.size.height / 2;
        this.coord.coord.bottom = this.coord.coordCenter.y + this.size.height / 2;
        this.coord.coord.left = this.coord.coordCenter.x - this.size.width / 2;
        this.coord.coord.right = this.coord.coordCenter.x + this.size.width / 2;
    }

    // Function to move the paddle on the board, and sending to everyone the new position
    move() {
        this.coord.coordCenter.x += this.directionX * this.speed;
        this.coord.coordCenter.y += this.directionY * this.speed;
        this.getNewPosition();

        //TODO: SOCKET GATEWAY
        // emitToEveryone('moveBall', { top: this.coord.coord.top, left: this.coord.coord.left });
    }

    // Function to reset the place of the paddle in the board
    resetPlace() {
        this.coord.coordCenter.x = 50;
        this.coord.coordCenter.y = 50;
        this.getNewPosition();

        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;

        //TODO: SOCKET GATEWAY
        // emitToEveryone('resetBall', { top: this.coord.coord.top, left: this.coord.coord.left });
    }
}