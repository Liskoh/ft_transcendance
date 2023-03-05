import { AbstractCommand } from '../abstract.command';

export class FollowCommand extends AbstractCommand {

    constructor(prefix: string, key: string) {
        super(prefix, key);
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