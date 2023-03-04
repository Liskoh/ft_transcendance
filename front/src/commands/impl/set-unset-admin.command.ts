import { AbstractCommand } from '../abstract.command';

export class SetUnsetAdminCommand extends AbstractCommand {

    private readonly giveAdminRole: boolean;

    constructor(prefix: string, key: string, giveAdminRole: boolean) {
        super(prefix, key);
        this.giveAdminRole = giveAdminRole;
    }

    public getCommandData(channelId: number, commandArgs: string[]): Object {
        const date = new Date(commandArgs[2]);

        return {
            channelId: channelId,
            nickname: commandArgs[0],
            giveAdminRole: this.giveAdminRole,
        }
    }

    public getCommandHelp(): string {
        return this.prefix + ' ' + '<nickname> - set admin role to <nickname>'
    }
}