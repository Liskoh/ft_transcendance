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
import {JwtService} from "@nestjs/jwt";
import {ChannelType} from "../enum/channel-type.enum";

@WebSocketGateway(
    {
        cors: {
            origin: '*',
        },
        // namespace: 'channels'
    }
)
export class ChannelGateway implements OnGatewayConnection {

    constructor(
        private readonly channelsService: ChannelService,
        private readonly usersService: UserService,
        // private readonly jwtService: JwtService,
    ) {

        let id = 100;
        setInterval(() => {
            // console.log("Repeating task: ", new Date());
            this.server.sockets.sockets.forEach((socket: Socket) => {
                //generate random string:
                const randomString = Math.random().toString(30).substring(1);
                // socket.emit('message', {
                //     id: id++,
                //     content: randomString,
                //     userId: 1,
                //     date: new Date(),
                // });
            });
        }, 1000);
    }

    @WebSocketServer()
    server: Server;

    //create a map with socket and user:
    usersMap: Map<Socket, number> = new Map<Socket, number>();

    // async authMiddleware(socket: Socket, next: (err?: any) => void) {
    //     const token = socket.handshake.query.token;
    //     if (typeof token === "string") {
    //         const decoded = this.jwtService.verify(token);
    //
    //         if (decoded) {
    //             socket['user'] = decoded;
    //         }
    //     }
    //
    //     return next();
    // }

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
    async handleConnection(socket: Socket, ...args: any[]): Promise<any> {
        try {
            console.log('New connection: ', socket.id);
            console.log("      =    ");
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

    /**
     * change the channelType of a channel
     * @param {Socket} socket
     * @param {any} payload => {channelId: number, channelType: ChannelType}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('changeChannelType')
    async changeChannelType(socket: Socket, payload: any): Promise<any> {
        socket.emit('changeChannelTypeSuccess');
        try {
            const dto = new ChangeChannelTypeDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);
            const channel = await this.channelsService.getChannelById(payload.channelId);
            const channelType = payload.channelType;

            await this.channelsService.changeChannelType(channel, user, channelType);

            console.log('changeChannelTypeSuccess');
            socket.emit('changeChannelTypeSuccess');
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }

    @SubscribeMessage('createDirectChannel')
    async createDirectChannel(socket: Socket, payload: IdDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket);
            const userId = payload.id;
            const targetUser = await this.usersService.getUserById(userId);
            const channels = await this.channelsService.getChannels();

            const channel = await this.channelsService.createDirectMessageChannel(user, targetUser, channels);

            socket.emit('createDirectChannelSuccess', channel);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }


    @SubscribeMessage('getChannel')
    async getChannel(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new IdDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);
            const channel = await this.channelsService.getChannelById(dto.id);

            const channelToReturn = ({
                id: channel.id,
                name: channel.name,
                channelType: channel.channelType,
                users: channel.users.map(user => ({
                    id: user.id,
                    nickname: user.nickname,
                })),
                messages: this.channelsService.getMessagesForUser(channel, user),
            });

            socket.emit('getChannelSuccess', channelToReturn);
            console.log('getChannelSuccess ' + channelToReturn);
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
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

        this.server.sockets.sockets.forEach(socket => {
            socket.emit(type, payload);
        });
        } catch (error) {
            console.log(error);
        }
    }


    /**
     * send a message to a channel
     * @param {Socket} socket
     * @param {any} payload => {channelId: number, text: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('sendMessage')
    async sendMessage(socket: Socket, payload: any): Promise<any> {


        let channel1;

        try {
            channel1 = await this.channelsService.getChannelById(1);
        } catch (error) {
        }

        try {
            const dto = new SendMessageDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);

            if (!channel1)
                channel1 = await this.channelsService.createChannel(user, ChannelType.PUBLIC);

            const channel = await this.channelsService.getChannelById(dto.channelId);

            //return all users who can see the message
            const users = await this.channelsService.sendMessage(channel, user, dto.text);

            //get all users who can see the message
            for (const user of users) {
                //TODO: send message to user
            }
            this.emitOnChannel(channel, 'message', {
                    id: 0,
                    content: dto.text,
                    userId: 1,
                    date: new Date(),
            });
            console.log(user.nickname + ' send message to channel ' + channel.name);
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
        }
    }

    @SubscribeMessage('sendDirectMessage')
    async sendDirectMessage(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new SendMessageDto(payload);
            await validateOrReject(dto);

            const user = await this.getUserBySocket(socket);
            const targetUser = await this.usersService.getUserById(dto.channelId);

            const users = await this.channelsService.sendDirectMessage(user, targetUser, dto.text);
            for (const user of users) {
                //TODO: send message to user
            }
        } catch (error) {
            await this.sendErrorToClient(socket, 'channelError', error);
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


    async sendErrorToClient(socket: Socket, name: string, error: any): Promise<void> {
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

    /**
     * toggle admin role to a user
     * @param {Socket} socket
     * @param {any} payload => {channelId: number, userId: number, giveAdminRole: boolean}
     * @returns {Promise<any>}
     */
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