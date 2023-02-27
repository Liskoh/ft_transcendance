import {OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {IdDto} from "../dto/id.dto";
import {ChannelService} from "../service/channel.service";
import {SendMessageDto} from "../dto/send-message.dto";
import {UserService} from "../../user/service/user.service";
import {User} from "../../user/entity/user.entity";
import {Channel} from "../entity/channel.entity";
import {validate, validateOrReject, ValidationError} from "class-validator";
import {DateDto} from "../dto/date.dto";
import {JoinChannelDto} from "../dto/join-channel.dto";
import {ApplyPunishmentDto} from "../dto/apply-punishment.dto";
import {CancelPunishmentDto} from "../dto/cancel-punishment.dto";
import {ToggleAdminRoleDto} from "../dto/toggle-admin-role.dto";
import {CreateChannelDto} from "../dto/create-channel.dto";
import {InviteUserDto} from "../dto/invite-user.dto";
import {ChangeChannelTypeDto} from "../dto/change-channel-type.dto";
import {HttpException, UsePipes} from "@nestjs/common";

@WebSocketGateway(
    {
        cors: {
            origin: '*',
        }
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
    usersMap: Map<Socket, number> = new Map<Socket, number>();

    async getUserBySocket(socket: Socket): Promise<User> {
        // const userId = this.usersMap.get(socket);
        // if (!userId) {
        //     this.usersMap.set(socket, 1);
        // }
        //
        // const users = await this.usersService.getUsers();
        // const randomIndex = Math.floor(Math.random() * users.length);

        const user = await this.usersService.getUserById(1);

        if (!user)
            throw new Error('User not found')

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

    async handleDisconnect(socket: any): Promise<any> {

    }

    @SubscribeMessage('getChannels')
    async getChannels(socket: Socket, payload: any): Promise<any> {
        try {
            await this.getJoinableChannels(socket, payload);
            await this.getJoinedChannels(socket, payload);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }

    @SubscribeMessage('getJoinableChannels')
    async getJoinableChannels(socket: Socket, payload: any): Promise<any> {
        try {
            const user = await this.getUserBySocket(socket);
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

    @SubscribeMessage('getJoinedChannels')
    async getJoinedChannels(socket: Socket, payload: any): Promise<any> {
        try {
            const user = await this.getUserBySocket(socket);
            const channels = await this.channelsService.getJoinedChannelsByUser(user);

            const channelList = channels.map(channel => ({
                id: channel.id,
                name: channel.name,
                password: (channel.password !== null),
                channelType: channel.channelType,
            }));

            socket.emit('joinedChannels', channelList);
        } catch (error) {

        }
    }

    /**
     * create a new channel
     * @param {Socket} socket
     * @param {CreateChannelDto} payload => {name: string, channelType: ChannelType, password: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('createChannel')
    async createChannel(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new CreateChannelDto(payload);
            await validateOrReject(payload);

            const user = await this.getUserBySocket(socket);
            const name = dto.name;
            const channelType = dto.channelType;
            const password = dto.password;

            const channel = await this.channelsService.createChannel(user, channelType, name, password);
            console.log('createChannelSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }

    /**
     * Invites a user to a channel
     * @param {Socket} socket
     * @param{InviteUserDto} payload => {channelId: number, nickname: string}
     */
    @SubscribeMessage('inviteUser')
    async inviteUser(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new InviteUserDto(payload);
            await validateOrReject(payload);

            const user = await this.getUserBySocket(socket);
            const channel = await this.channelsService.getChannelById(dto.channelId);
            const targetUser = await this.usersService.getUserByNickname(dto.nickname);

            await this.channelsService.inviteUser(channel, user, targetUser);

            socket.emit('inviteUserSuccess', channel);
            console.log('inviteUserSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }

    @SubscribeMessage('changeChannelType')
    async changeChannelType(socket: Socket, payload: ChangeChannelTypeDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket);
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

            const user = await this.getUserBySocket(socket);
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
    async joinChannel(socket: Socket, payload: any): Promise<void> {
        try {
            const dto = new JoinChannelDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);
            const channel = await this.channelsService.getChannelById(payload.id);
            const password = payload.password;

            await this.channelsService.joinChannel(channel, user, password);

            socket.emit('joinChannelSuccess');
            console.log('joinChannelSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
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
    async leaveChannel(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new IdDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);
            const channel = await this.channelsService.getChannelById(dto.id);

            await this.channelsService.leaveChannel(channel, user);
            socket.emit('leaveChannelSuccess', dto.id);

            console.log('leaveChannelSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }


    async sendErrorToClient(socket: Socket, name: string, error: any) : Promise<void> {
        console.log(socket.id + ' socketId send an invalid request: ' + error);

        if (error instanceof HttpException) {
            socket.emit(name, error);
            return;
        }

        if (error instanceof Object) {
            socket.emit(name, {message: "Invalid request, please check your data"});
            return;
        }
    }

    /**
     * apply punishment to a user
     * @param {Socket} socket
     * @param {ApplyPunishmentDto} payload => {channelId: number, userId: number, punishmentType: PunishmentType, date: Date}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('applyPunishment')
    async applyPunishment(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new ApplyPunishmentDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);

            let channel = await this.channelsService.getChannelById(dto.channelId);
            const userToPunish = await this.usersService.getUserByNickname(dto.nickname);
            const punishmentType = dto.punishmentType;
            const date = dto.date;

            //TODO: DEBUG REMOVE:
            // {
            //     channel = await this.channelsService.joinChannel(channel, userToPunish, '1234');
            // }

            await this.channelsService.applyPunishment(channel, user, userToPunish, punishmentType, date);
            socket.emit('applyPunishmentSuccess');
            console.log('applyPunishmentSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }

    /**
     * cancel punishment to a user
     * @param {Socket} socket
     * @param {CancelPunishmentDto} payload => {channelId: number, userId: number, punishmentType: PunishmentType}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('cancelPunishment')
    async cancelPunishment(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new CancelPunishmentDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);

            const channel = await this.channelsService.getChannelById(dto.channelId);
            const userToCancel = await this.usersService.getUserByNickname(dto.nickname);
            const punishmentType = dto.punishmentType;

            await this.channelsService.cancelPunishment(channel, user, userToCancel, punishmentType);
            socket.emit('cancelPunishmentSuccess');
            console.log('cancelPunishmentSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }

    @SubscribeMessage('toggleAdminRole')
    async toggleAdminRole(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new ToggleAdminRoleDto(payload);
            await validateOrReject(payload);

            const user = await this.getUserBySocket(socket);

            const channel = await this.channelsService.getChannelById(dto.channelId);
            const userToToggle = await this.usersService.getUserByNickname(dto.nickname);
            const giveAdminRole = dto.giveAdminRole;

            await this.channelsService.toggleAdminRole(channel, user, userToToggle, giveAdminRole);
            socket.emit('toggleAdminRoleSuccess');
            console.log('toggleAdminRoleSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }

}