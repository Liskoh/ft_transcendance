import { AbstractCommand } from '../abstract.command';
import {SocketType} from "@/utils/socket-type.enum";

export class UnPunishCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key, SocketType.CHANNEL);
    }

    public getCommandData(channelId: number, commandArgs: string[]): Object {
        const date = new Date(commandArgs[2]);

        return {
            channelId: channelId,
            nickname: commandArgs[0],
            punishmentType: commandArgs[1],
            date: date,
        }
    }

    public getCommandHelp(): string {
        return this.prefix + ' ' + '<nickname> <punishmentType> - Unpunish <nickname> with <punishmentType>'
    }
}