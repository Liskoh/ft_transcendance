import io from "socket.io-client";
import {AbstractCommand} from "@/commands/abstract.command";
import {InviteCommand} from "@/commands/impl/invite.command";
import {ChangeChannelTypeCommand} from "@/commands/impl/change-channel-type.command";
import {PunishCommand} from "@/commands/impl/punish.command";
import {UnPunishCommand} from "@/commands/impl/un-punish.command";
import {SetUnsetAdminCommand} from "@/commands/impl/set-unset-admin.command";

export const SOCKET_SERVER = io('http://localhost:8000/');

export const COMMANDS: AbstractCommand[] = [] = [
    new InviteCommand('/invite', 'inviteUser'),
    new ChangeChannelTypeCommand('/change-channel-type', 'changeChannelType'),
    new PunishCommand('/punish', 'applyPunishment'),
    new UnPunishCommand('/un-punish', 'cancelPunishment'),
    new SetUnsetAdminCommand('/set-admin', 'toggleAdminRole', true),
    new SetUnsetAdminCommand('/unset-admin', 'toggleAdminRole', false),
];

//get a command by its name:
export function getCommandByName(prefix: string): AbstractCommand {
    return COMMANDS.find(c => c.prefix.toLowerCase() === prefix.toLowerCase());
}