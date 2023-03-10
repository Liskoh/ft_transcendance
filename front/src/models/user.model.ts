
export class User {

    constructor(id: number, login: string, nickname: string, status: string) {
        this.id = id;
        this.nickname = nickname;
        this.login = login;
        this.status = status;
    }

    id: number;
    login: string;
    nickname: string;
    status: string;
}