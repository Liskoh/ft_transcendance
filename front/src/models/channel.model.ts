import {Message} from "@/models/message.model";

export class Channel {

    constructor(id: number, name: string, messages: Message[]) {
        this.id = id;
        this.name = name;
        this.messages = messages;
    }

    id: number;
    name: string;
    messages: Message[];

    addMessage(message: Message) {
        this.messages.push(message);
    }
}