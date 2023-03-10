import { AbstractCommand } from '../abstract.command';
import {SocketType} from "@/utils/socket-type.enum";

export class MessagePrivateCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key, SocketType.CHANNEL);
    }

    public getCommandData(channelId: number, commandArgs: string[]): Object {
        return {
            nickname: commandArgs[0],
            text: commandArgs.slice(1).join(' '),
        };
    }

    public getCommandHelp(): string {
        return this.prefix + ' ' + '<nickname> - Invite <nickname> to the channel'
    }
}