import type {Message} from "@/models/message.model";
import {User} from "@/models/user.model";

export class Channel {

    constructor(
        id: number,
        name: string,
        channelType: String,
        users: User[],
        password: boolean,
        messages: Message[]) {
        this.id = id;
        this.name = name;
        this.channelType = channelType;
        this.users = users;
        this.password = password;
        this.messages = messages;
    }

    id: number;
    name: string;
    channelType: String;
    users: User[];
    password: boolean;
    messages: Message[];

    addMessage(message: Message) {
        this.messages.push(message);
    }
}