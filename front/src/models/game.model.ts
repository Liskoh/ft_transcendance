
export class Game {

    constructor(uuid: string, firstNickname: string, secondNickname: string) {
        this.uuid = uuid;
        this.firstNickname = firstNickname;
        this.secondNickname = secondNickname;
    }

    uuid: string;
    firstNickname: string;
    secondNickname: string;
}