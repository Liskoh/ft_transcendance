import {OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {IdDto} from "../dto/id.dto";
import {ChannelService} from "../service/channel.service";
import {SendMessageDto} from "../dto/send-message.dto";
import {UserService} from "../../user/service/user.service";
import {User} from "../../user/entity/user.entity";
import {Channel} from "../entity/channel.entity";
import {validate, ValidationError} from "class-validator";
import {DateDto} from "../dto/date.dto";
import {JoinChannelDto} from "../dto/join-channel.dto";
import {ApplyPunishmentDto} from "../dto/apply-punishment.dto";
import {CancelPunishmentDto} from "../dto/cancel-punishment.dto";
import {ToggleAdminRoleDto} from "../dto/toggle-admin-role.dto";
import {CreateChannelDto} from "../dto/create-channel.dto";
import {InviteUserDto} from "../dto/invite-user.dto";
import {ChangeChannelTypeDto} from "../dto/change-channel-type.dto";

@WebSocketGateway(
    {
        namespace: 'channels',
        port: 3001,

    }
)
export class ChannelGateway implements OnGatewayConnection {

    constructor(
        private readonly channelsService: ChannelService,
        private readonly usersService: UserService,
    ) {
    }

    @WebSocketServer()
    server: Server;

    //create a map with socket and user:
    usersMap: Map<Socket, User> = new Map<Socket, User>();

    async getUserBySocket(socket: Socket, update?: boolean): Promise<User> {
        const user = this.usersMap.get(socket);
        if (!user)
            throw new Error('User not found');

        if (update) {
            const updatedUser = await this.usersService.getUserById(user.id);
            this.usersMap.set(socket, updatedUser);
            return updatedUser;
        }

        return user;
    }

    // Override method from OnGatewayConnection
    //TODO: Implement authentication
    async handleConnection(socket: any, ...args: any[]): Promise<any> {
        try {

        } catch (ex) {
            console.log(ex);
        }
    }

    @SubscribeMessage('getChannels')
    async getChannels(socket: Socket, payload: any): Promise<any> {
        try {

        } catch (error) {

        }
    }

    @SubscribeMessage('getAvailableChannels')
    async sendMyChannels(socket: Socket, payload: any): Promise<any> {
        try {
            const user = await this.getUserBySocket(socket, true);
            const channels = await this.channelsService.getAvailableChannelsByUser(user);

            const channelList = channels.map(channel => ({
                id: channel.id,
                name: channel.name,
                channelType: channel.channelType,
            }));

            socket.emit('availableChannels', channelList);
        } catch (error) {

        }
    }

    @SubscribeMessage('createChannel')
    async createChannel(socket: Socket, payload: CreateChannelDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const name = payload.name;
            const channelType = payload.channelType;
            const password = payload.password;

            const channel = await this.channelsService.createChannel(user, channelType, name, password);

        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    @SubscribeMessage('inviteUser')
    async inviteUser(socket: Socket, payload: InviteUserDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const channel = await this.channelsService.getChannelById(payload.channelId);
            const targetUser = await this.usersService.getUserById(payload.userId);

            await this.channelsService.inviteUser(channel, user, targetUser);

            socket.emit('inviteUserSuccess', channel);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    @SubscribeMessage('changeChannelType')
    async changeChannelType(socket: Socket, payload: ChangeChannelTypeDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const channel = await this.channelsService.getChannelById(payload.channelId);
            const channelType = payload.channelType;

            await this.channelsService.changeChannelType(channel, user, channelType);

            socket.emit('changeChannelTypeSuccess', channel);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    @SubscribeMessage('createDirectChannel')
    async createDirectChannel(socket: Socket, payload: IdDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const userId = payload.id;
            const targetUser = await this.usersService.getUserById(userId);

            const channel = await this.channelsService.createDirectMessageChannel(user, targetUser);

            socket.emit('createDirectChannelSuccess', channel);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }




    @SubscribeMessage('getChannel')
    async getChannel(socket: Socket, payload: IdDto): Promise<any> {
        try {
            await validate(payload);

            const channel = await this.channelsService.getChannelById(payload.id);

            socket.emit('getChannelSuccess', channel);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    /**
     * send a socket message to all user in a channel
     * @param {Channel} channel
     * @param {string} type
     * @param {any} payload
     * @returns {void}
     */
    emitOnChannel(channel: Channel, type: string, payload: any): void {
        try {
            if (!channel || !channel.users)
                return;

            const socketIds: string[] = Object.keys(this.server.sockets.sockets);

            for (const socketId of socketIds) {
                const socket = this.server.sockets.sockets[socketId];
                const user: User = socket.data.user;

                if (channel.users.includes(user)) {
                    socket.emit(type, payload);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * send a message to a channel
     * @param {Socket} socket
     * @param {SendMessageDto} payload => {id: number, text: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('sendMessage')
    async sendMessage(socket: Socket, payload: SendMessageDto): Promise<any> {
        try {
            await validate(payload);

            const channel = await this.channelsService.getChannelById(payload.id);
            const user = socket.data.user;

            const users = await this.channelsService.sendMessage(channel, user, payload.text);

            //get all users who can see the message
            for (const user of users) {
                //TODO: send message to user
            }

            socket.emit('sendMessageSuccess');
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    /**
     * Join a channel with a password or without
     * @param {Socket} socket
     * @param {JoinChannelDto} payload => {id: number, password?: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('joinChannel')
    async joinChannel(socket: Socket, payload: JoinChannelDto): Promise<void> {
        try {
            await validate(payload);

            const channel = await this.channelsService.getChannelById(payload.id);
            const user = socket.data.user;
            const password = payload.password;

            // if (payload.password) {
                await this.channelsService.joinChannel(channel, user, password);
            // } else {
            //     await this.channelsService.joinChannel(channel, user);
            // }

            socket.emit('joinChannelSuccess');
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    /**
     * Leave a channel
     * @param {Socket} socket
     * @param {any} payload => {id: number}
     * @returns {Promise<any>}
     */
    //TODO: SEND SOCKET WHEN OWNER CHANGE ?
    @SubscribeMessage('leaveChannel')
    async leaveChannel(socket: Socket, payload: IdDto): Promise<any> {
        try {
            await validate(payload);

            const user = socket.data.user;
            const channel = await this.channelsService.getChannelById(payload.id);

            await this.channelsService.leaveChannel(channel, user);
            socket.emit('leaveChannelSuccess');

            //TODO: Send message to all user in channel
        } catch (error) {
            socket.emit('channelError', error);
        }
    }


    /**
     * apply punishment to a user
     * @param {Socket} socket
     * @param {ApplyPunishmentDto} payload => {channelId: number, userId: number, punishmentType: PunishmentType, date: Date}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('applyPunishment')
    async applyPunishment(socket: Socket, payload: ApplyPunishmentDto): Promise<any> {
        try {
            await validate(payload);

            const user = socket.data.user;

            const channel = await this.channelsService.getChannelById(payload.channelId);
            const userToPunish = await this.usersService.getUserById(payload.userId);
            const punishmentType = payload.punishmentType;
            const date = payload.date;

            await this.channelsService.applyPunishment(channel, user, userToPunish, punishmentType, date);
            socket.emit('applyPunishmentSuccess');
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    /**
     * cancel punishment to a user
     * @param {Socket} socket
     * @param {CancelPunishmentDto} payload => {channelId: number, userId: number, punishmentType: PunishmentType}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('cancelPunishment')
    async cancelPunishment(socket: Socket, payload: CancelPunishmentDto): Promise<any> {
        try {
            await validate(payload);

            const user = socket.data.user;

            const channel = await this.channelsService.getChannelById(payload.channelId);
            const userToCancel = await this.usersService.getUserById(payload.userId);
            const punishmentType = payload.punishmentType;

            await this.channelsService.cancelPunishment(channel, user, userToCancel, punishmentType);
            socket.emit('cancelPunishmentSuccess');
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    @SubscribeMessage('toggleAdminRole')
    async toggleAdminRole(socket: Socket, payload: ToggleAdminRoleDto): Promise<any> {
        try {
            await validate(payload);

            const user = socket.data.user;

            const channel = await this.channelsService.getChannelById(payload.channelId);
            const userToToggle = await this.usersService.getUserById(payload.userId);
            const giveAdminRole = payload.giveAdminRole;

            await this.channelsService.toggleAdminRole(channel, user, userToToggle, giveAdminRole);
            socket.emit('toggleAdminRoleSuccess', giveAdminRole);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

}