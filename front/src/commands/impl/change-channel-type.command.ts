import { AbstractCommand } from '../abstract.command';

export class ChangeChannelTypeCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key);
    }

    public getCommandData(channelId: number, commandArgs: string[]): Object {
        return {
            channelId: channelId,
            channelType: commandArgs[0],
        };
    }

    public getCommandHelp(): string {
        return this.prefix + ' ' + '<channelType> - Change channel type to <channelType>'
    }
}