import {DirectionState} from "../enum/direction-state.enum";
import {Coord} from "./coord.model";
import {Socket} from "socket.io";

export class Player {
    keyPress: {[key:string]: boolean};
    id: number;
    name: string;
    client: Socket;
    speed: number;
    score: number;
    size: {width: number; height: number};
    coord: Coord;

    constructor(position: {top: number; left: number; width: number; height: number}, id: number, client: Socket, board: {top: number; left: number; width: number; height: number}) {
        this.keyPress = {};
        this.id = id;
        this.name = 'player' + this.id;
        this.client = client;
        this.speed = 1;
        this.score = 0;
        this.size = {
            width: (position.width / board.width) * 100,
            height: (position.height / board.height) * 100
        }
        this.coord = new Coord(position, this.size, board);
    }

    getNewPosition(): void {
        this.coord.coord.top = this.coord.coordCenter.y - this.size.height / 2;
        this.coord.coord.bottom = this.coord.coordCenter.y + this.size.height / 2;
        this.coord.coord.left = this.coord.coordCenter.x - this.size.width / 2;
        this.coord.coord.right = this.coord.coordCenter.x + this.size.width / 2;
    }

    move(way: number): void {
        if (way === DirectionState.UP && this.coord.coord.top - this.speed < 0) {
            this.coord.coordCenter.y = this.size.height / 2;
        } else if (way === DirectionState.DOWN && this.coord.coord.bottom + this.speed > 100) {
            this.coord.coordCenter.y = 100 - this.size.height / 2;
        } else {
            this.coord.coordCenter.y += this.speed * way;
        }

        this.getNewPosition();
    }

    resetPlace(): void {
        this.coord.coordCenter.y = 50;
        this.getNewPosition();

        this.client.emit('resetPaddle', this.coord.coord.top);
        //TODO: SOCKET GATEWAY
        // for (let id in spectators) {
        //     spectators[id].emit('resetPaddle', this.coord.coord.top);
        // }
    }
}