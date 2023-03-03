
export class Message {

    constructor(id: number, content: string, userId: number, nickname: string, date: Date) {
        this.id = id;
        this.content = content;
        this.userId = userId;
        this.nickname = nickname;
        this.date = date;
    }

    id: number;
    content: string;
    userId: number;
    nickname: string;
    date: Date;
}