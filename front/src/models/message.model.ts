
export class Message {

    constructor(id: number, content: string, userId: number, date: Date) {
        this.id = id;
        this.content = content;
        this.userId = userId;
        this.date = date;
    }

    id: number;
    content: string;
    userId: number;
    date: Date;
}