
export class Message {

    constructor(id: number, channelId: number, content: string, userId: number, nickname: string, date: Date) {
        this.id = id;
        this.channelId = channelId;
        this.content = content;
        this.userId = userId;
        this.nickname = nickname;
        this.date = date;
    }

    id: number;
    channelId: number;
    content: string;
    userId: number;
    nickname: string;
    date: Date;
}