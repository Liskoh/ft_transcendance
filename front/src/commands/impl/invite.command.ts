import { AbstractCommand } from '../abstract.command';

export class InviteCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key);
    }

    public getCommandData(channelId: number, commandArgs: string[]): Object {
        return {
            channelId: channelId,
            nickname: commandArgs[0],
        };
    }
}