import { AbstractCommand } from '../abstract.command';
import {SocketType} from "@/utils/socket-type.enum";

export class PunishCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key, SocketType.CHANNEL);
    }

    public getCommandData(channelId: number, commandArgs: string[]): Object {
        const dateString: string = commandArgs[2];
        let toSend = null;

        if (dateString) {

            const splitedDate: string[] = dateString.split(':');

            const hours = (splitedDate[0]) ? splitedDate[0] : '00';
            const minutes = splitedDate[1] ? splitedDate[1] : '00';
            const seconds = splitedDate[2] ? splitedDate[2] : '00';

            let date = new Date();

            try {
                date.setHours(date.getHours() + parseInt(hours));
                date.setMinutes(date.getMinutes() + parseInt(minutes));
                date.setSeconds(date.getSeconds() + parseInt(seconds));
            } catch (e) {
            }

            if (hours === '00' && minutes === '00' && seconds === '00')
                toSend = null;
            else
                toSend = date;
        }

        return {
            channelId: channelId,
            nickname: commandArgs[0],
            punishmentType: commandArgs[1],
            date: toSend,
        }
    }

    public getCommandHelp(): string {
        return this.prefix + ' ' + '<nickname> <punishmentType> <date> - Punish <nickname> with <punishmentType> until <date>'
    }
}