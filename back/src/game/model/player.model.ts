import {DirectionState} from "../enum/direction-state.enum";
import {Coord} from "./coord.model";
import {Socket} from "socket.io";
import {BOARD_HEIGHT} from "../../consts";

export class Player {
    keyPress: { [key: string]: boolean };
    id: string;
    userId: number;
    name: string;
    client: Socket;
    speed: number;
    score: number;
    size: { width: number; height: number };
    coord: Coord;

    constructor(position: {
                    top: number,
                    left: number,
                    width: number,
                    height: number
                },
                id: string,
                userId: number,
                client: Socket,) {
        this.keyPress = {};
        this.id = id;
        this.userId = userId;
        this.name = 'player' + this.id;
        this.client = client;
        this.speed = BOARD_HEIGHT * 1.25 / 100;
        this.score = 0;
        this.size = {
            width: position.width,
            height: position.height
        }
        this.coord = new Coord(position, this.size);
    }

    getNewPosition(): void {
        this.coord.coord.bottom = this.coord.coord.top + this.size.height;
    }

    move(way: DirectionState): void {
        if (way === DirectionState.UP && this.coord.coord.top - this.speed < 0) {
            this.coord.coord.top = 0;
        } else if (way === DirectionState.DOWN && this.coord.coord.bottom + this.speed > BOARD_HEIGHT) {
            this.coord.coord.top = BOARD_HEIGHT - this.size.height;
        } else {
            this.coord.coord.top += this.speed * way;
        }

        this.getNewPosition();
    }

    resetPlace(): void {
        this.coord.coord.top = BOARD_HEIGHT / 2 - this.size.height / 2
        this.getNewPosition();
    }
}