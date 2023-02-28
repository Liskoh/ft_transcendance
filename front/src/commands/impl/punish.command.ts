import { AbstractCommand } from '../abstract.command';

export class PunishCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key);
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
        return this.prefix + ' ' + '<nickname> <punishmentType> <date> - Punish <nickname> with <punishmentType> until <date>'
    }
}