export class Coord {
    coordCenter: {x: number; y: number};
    coord: {top: number; bottom: number; left: number; right: number}

    constructor(position: {top: number; left: number; width: number; height: number}, size: {width: number; height: number}) {
        this.coord = {
            top: position.top,
            bottom: position.top + size.height,
            left: position.left,
            right: position.left + size.width,
        }
    }
}