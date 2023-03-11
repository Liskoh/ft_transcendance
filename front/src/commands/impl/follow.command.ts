import { AbstractCommand } from '../abstract.command';
import {SocketType} from "@/utils/socket-type.enum";

export class FollowCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key, SocketType.USER);
    }

    public getCommandData(channelId: number, commandArgs: string[]): Object {
        return {
            login: commandArgs[0],
        };
    }

    public getCommandHelp(): string {
        return this.prefix + ' ' + '<nickname> - follow <nickname>'
    }
}