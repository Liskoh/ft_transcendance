import io from "socket.io-client";
import type {AbstractCommand} from "@/commands/abstract.command";
import {InviteCommand} from "@/commands/impl/invite.command";
import {ChangeChannelTypeCommand} from "@/commands/impl/change-channel-type.command";
import {PunishCommand} from "@/commands/impl/punish.command";
import {UnPunishCommand} from "@/commands/impl/un-punish.command";
import {SetUnsetAdminCommand} from "@/commands/impl/set-unset-admin.command";
import {BlockUnblockCommand} from "@/commands/impl/block-unblock.command";
import {FollowCommand} from "@/commands/impl/follow.command";
import {MessagePrivateCommand} from "@/commands/impl/message-private.command";

// export const SOCKET_SERVER = io('http://localhost:8000/');

export const COMMANDS: AbstractCommand[] = [] = [
    new InviteCommand('/invite', 'inviteUser'),
    new ChangeChannelTypeCommand('/change-channel-type', 'changeChannelType'),
    new PunishCommand('/punish', 'applyPunishment'),
    new UnPunishCommand('/un-punish', 'cancelPunishment'),
    new SetUnsetAdminCommand('/set-admin', 'toggleAdminRole', true),
    new SetUnsetAdminCommand('/unset-admin', 'toggleAdminRole', false),
    new BlockUnblockCommand('/block', 'blockUser'),
    new BlockUnblockCommand('/unblock', 'unblockUser'),
    new FollowCommand('/follow', 'followAsFriend'),
    new MessagePrivateCommand('/mp', 'sendDirectMessage'),
];

//get a command by its name:
export function getCommandByName(prefix: string): AbstractCommand {
    return COMMANDS.find(c => c.prefix.toLowerCase() === prefix.toLowerCase());
}

// export const VUE_APP_WEB_HOST: string = '127.0.0.1';
export const VUE_APP_WEB_HOST: string = '10.13.8.5';
export const VUE_APP_BACK_PORT: number = 8000;
export const VUE_APP_FRONT_PORT: number = 5173;