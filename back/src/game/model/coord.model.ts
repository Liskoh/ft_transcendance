export class Coord {
    coordCenter: {x: number; y: number};
    coord: {top: number; bottom: number; left: number; right: number}

    constructor(position: {top: number; left: number; width: number; height: number}, size: {width: number; height: number}, board: {top: number; left: number; width: number; height: number}) {
        this.coordCenter = {
            x: (size.width / 2) + (((position.left - board.left) / board.width) * 100),
            y: (size.height / 2) + (((position.top - board.top) / board.height) * 100)
        }
        this.coord = {
            top: this.coordCenter.y - size.height / 2,
            bottom: this.coordCenter.y + size.height / 2,
            left: this.coordCenter.x - size.width / 2,
            right: this.coordCenter.x + size.width / 2
        }
    }
}