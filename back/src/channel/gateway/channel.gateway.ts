import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
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
import {HttpException, HttpStatus, UsePipes} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {ChannelType} from "../enum/channel-type.enum";
import {AuthService} from "../../auth/auth.service";
import {
    getSocketsByUser,
    getUserBySocket,
    sendErrorToClient,
    sendSuccessToClient,
    tryHandleConnection,
    tryHandleDisconnect
} from "../../utils";
import {Message} from "../entity/message.entity";
import {SendDirectMessageDto} from "../dto/send-direct-message.dto";
import {PunishmentType} from "../enum/punishment-type.enum";
import {LoginNicknameDto} from "../../user/dto/login-nickname.dto";
import {GameService} from "../../game/service/game.service";
import {Duel} from "../../game/interface/duel.interface";

@WebSocketGateway(
    {
        cors: {
            origin: '*',
        },
        namespace: 'channels'
    }
)
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly channelsService: ChannelService,
        private readonly usersService: UserService,
        private readonly authService: AuthService,
        private readonly gameService: GameService,
        // private readonly jwtService: JwtService,
    ) {
    }

    @WebSocketServer()
    server: Server;

    private usersMap: Map<Socket, string> = new Map();

    /**
     * send a socket message to all user in a channel
     * @param {Channel} channel
     * @param {string} type
     * @param {any} payload
     * @param {User[]} users
     * @returns {Promise<void>}
     */
    emitOnChannel(channel: Channel, type: string, payload: any, users?: User[]): void {
        try {
            if (!channel || !channel.users)
                return;

            this.usersMap.forEach((value, key) => {

                //in case if we need to send message to specific users
                if (users) {
                    users.forEach(user => {
                        if (user.login === value)
                            key.emit(type, payload);
                    });
                    return;
                }

                //we need to send message to all users in channel
                channel.users.forEach(user => {
                    if (user.login === value) {
                        key.emit(type, payload);
                    }
                    return;
                });
            });

        } catch (error) {
            console.log(error);
        }
    }

    async handleConnection(socket: Socket, ...args: any[]): Promise<any> {
        await tryHandleConnection(socket, this.usersMap,
            this.usersService, this.authService,
            'channels', ...args);
    }

    async handleDisconnect(socket: any): Promise<any> {
        await tryHandleDisconnect(socket, this.usersMap, 'channels');
    }


    @SubscribeMessage('getChannels')
    async getChannels(socket: Socket, payload: any): Promise<any> {
        try {
            const channels: Channel[] = await this.channelsService.getChannels();

            await this.sendJoinedChannels(socket, channels);
            await this.sendJoinAbleChannels(socket, channels);
            await this.sendDirectChannels(socket, channels);
        } catch (error) {

        }
    }


    async sendJoinAbleChannels(socket: Socket, dataChannels: Channel[]): Promise<any> {
        try {
            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channels = await this.channelsService.getAvailableChannelsByUser(user, dataChannels);
            console.log(channels.length);

            const joinAbleChannels = [];

            for (const channel of channels)
                joinAbleChannels.push(this.getChannelToSend(channel, user));

            socket.emit('joinableChannels', joinAbleChannels);
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
        }
    }

    async sendJoinedChannels(socket: Socket, dataChannels: Channel[]): Promise<any> {
        try {
            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channels = await this.channelsService.getJoinedChannelsByUser(user, dataChannels);

            const joinedChannels = [];

            for (const channel of channels)
                joinedChannels.push(this.getChannelToSend(channel, user));

            socket.emit('joinedChannels', joinedChannels);
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
        }
    }

    async sendDirectChannels(socket: Socket, dataChannels: Channel[]): Promise<any> {
        try {
            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channels = await this.channelsService.getDirectChannelsByUser(user, dataChannels);

            const joinedChannels = [];

            for (const channel of channels)
                joinedChannels.push(this.getChannelToSend(channel, user));

            socket.emit('directChannels', joinedChannels);
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
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
        console.log('createChannel ' + JSON.stringify(payload));
        try {
            const dto = new CreateChannelDto(payload);
            await validateOrReject(payload);

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const name = dto.name;
            const channelType = dto.channelType;
            const password = dto.password;

            const channel = await this.channelsService.createChannel(user, channelType, name, password);
            await sendSuccessToClient(socket, 'channelSuccess', 'Channel ' + channel.name + ' created');

            const channels: Channel[] = await this.channelsService.getChannels();

            await this.sendJoinedChannels(socket, channels);

            for (const [key, value] of this.usersMap) {
                await this.sendJoinAbleChannels(key, channels);
            }
            console.log('createChannel ' + JSON.stringify(payload));
        } catch (error) {
            console.log(error);
            await sendErrorToClient(socket, 'channelError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channel = await this.channelsService.getChannelById(dto.channelId);
            const targetUser = await this.usersService.getUserByNickname(dto.nickname);

            await this.channelsService.inviteUser(channel, user, targetUser);

            await sendSuccessToClient(socket, 'channelSuccess', 'You invited ' + targetUser.nickname + ' to the channel');
            const targetSocket: Socket = await getSocketsByUser(targetUser, this.usersMap);

            if (targetSocket) {
                await sendSuccessToClient(targetSocket, 'channelSuccess', user.nickname +
                    ' invited you to the channel ' + channel.name);
                const channels: Channel[] = await this.channelsService.getChannels();
                await this.sendJoinedChannels(targetSocket, channels);
                await this.sendJoinAbleChannels(targetSocket, channels);
            }
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channel = await this.channelsService.getChannelById(payload.channelId);
            const channelType = payload.channelType;

            await this.channelsService.changeChannelType(channel, user, channelType);

            console.log('changeChannelTypeSuccess');
            socket.emit('changeChannelTypeSuccess');
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
        }
    }

    @SubscribeMessage('createDirectChannel')
    async createDirectChannel(socket: Socket, payload: IdDto): Promise<any> {
        try {
            await validate(payload);

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const userId = payload.id;
            const targetUser = await this.usersService.getUserById(userId);
            const channels = await this.channelsService.getChannels();

            const channel = await this.channelsService.createDirectMessageChannel(user, targetUser, channels);

            socket.emit('createDirectChannelSuccess', channel);
        } catch (error) {
            socket.emit('channelError', error);
        }
    }


    /**
     * get all data from a channel
     * @param {Socket} socket
     * @param {any} payload => {id: number}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('getChannel')
    async getChannel(socket: Socket, payload: any): Promise<any> {
        console.log('getChannel ' + payload.id);
        try {
            const dto = new IdDto(payload);
            await validateOrReject(dto);

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channel = await this.channelsService.getChannelById(dto.id);

            const channelToReturn = this.getChannelToSend(channel, user);

            socket.emit('getChannelSuccess', channelToReturn);

        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
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
        try {
            const dto = new SendMessageDto(payload);
            await validateOrReject(dto);

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channel = await this.channelsService.getChannelById(dto.channelId);

            const users = await this.channelsService.sendMessage(channel, user, dto.text);
            const message: Message = await this.channelsService.saveMessage(dto.text, user, channel);

            this.emitOnChannel(
                channel,
                'message',
                {
                    channelId: channel.id,
                    id: message.id,
                    content: message.text,
                    userId: user.id,
                    nickname: user.nickname,
                    date: message.date,
                },
                users
            );
            console.log(user.nickname + ' send message to channel ' + channel.name);
            await sendSuccessToClient(socket, 'channelSuccess', 'message sent with success');
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
        }
    }

    /**
     * send a direct message to a user
     * @param {Socket} socket
     * @param {any} payload => {channelId: number, text: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('sendDirectMessage')
    async sendDirectMessage(socket: Socket, payload: any): Promise<any> {
        try {
            const dto: SendDirectMessageDto = new SendDirectMessageDto(payload);
            await validateOrReject(dto);

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const targetUser = await this.usersService.getUserByNickname(dto.nickname);
            const channels = await this.channelsService.getChannels();

            let channel: Channel = await this.channelsService.getDirectChannel(user, targetUser, channels);
            let created: boolean = false;

            if (!channel) {
                channel = await this.channelsService.createDirectMessageChannel(user, targetUser, channels);
                created = true;
            }

            if (!channel.name.toLowerCase().includes(user.nickname.toLowerCase()) || !channel.name.toLowerCase().includes(targetUser.nickname.toLowerCase())) {
                channel.name = user.nickname + ' & ' + targetUser.nickname;
                await this.channelsService.saveChannel(channel);
                created = true;
            }

            const users = await this.channelsService.sendMessage(channel, user, dto.text);
            const message: Message = await this.channelsService.saveMessage(dto.text, user, channel);

            this.emitOnChannel(
                channel,
                'message',
                {
                    channelId: channel.id,
                    id: message.id,
                    content: message.text,
                    userId: user.id,
                    nickname: user.nickname,
                    date: message.date,
                    users: users,
                },
            );

            if (!created)
                return;

            await this.sendDirectChannels(socket, channels);

            const targetSocket = await getSocketsByUser(targetUser, this.usersMap);
            if (targetSocket) {
                await sendSuccessToClient(targetSocket, 'channelSuccess', user.nickname + ' send you a private message!');
            }

        } catch (error) {
            console.log(error);
            await sendErrorToClient(socket, 'channelError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channel = await this.channelsService.getChannelById(dto.id);
            const password = dto.password;

            await this.channelsService.joinChannel(channel, user, password);
            await this.sendJoinedChannels(socket, await this.channelsService.getChannels());
            await this.sendJoinAbleChannels(socket, await this.channelsService.getChannels());
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
        }
    }

    /**
     * Leave a channel
     * @param {Socket} socket
     * @param {any} payload => {id: number}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('leaveChannel')
    async leaveChannel(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new IdDto(payload);
            await validateOrReject(dto);

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const channel = await this.channelsService.getChannelById(dto.id);

            await this.channelsService.leaveChannel(channel, user);
            const channels: Channel[] = await this.channelsService.getChannels();
            await this.sendJoinedChannels(socket, channels);
            await this.sendJoinAbleChannels(socket, channels);
            await sendSuccessToClient(socket, 'channelSuccess', 'You have left the channel '
                + channel.name + 'with success');

            this.emitOnChannel(channel, 'channelError', user.nickname + ' has left the channel ' + channel.name);

            if (channel.users.length <= 1) {
                for (const [key, value] of this.usersMap) {
                    await this.sendJoinAbleChannels(key, channels);
                    await this.sendJoinedChannels(key, channels);
                }
            }
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
        }
    }

    @SubscribeMessage('duel')
    async duel(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new LoginNicknameDto(payload.login);
            await validateOrReject(dto);

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const targetUser = await this.usersService.getUserByNickname(dto.login);

            const duel: Duel = this.gameService.createDuel(user, targetUser);
            const targetSocket = await getSocketsByUser(targetUser, this.usersMap);

            await sendSuccessToClient(socket, 'channelSuccess', 'You have challenged '
                + targetUser.nickname + ' for a pong duel! (go on Game tab)');

            if (!targetSocket)
                return;

            await sendSuccessToClient(targetSocket, 'channelSuccess', 'You have been challenged by '
                + user.nickname + ' for a pong duel! (go on Game tab)');

            socket.emit('sendOnGame');
        } catch (error) {
            console.log(error);
            await sendErrorToClient(socket, 'channelError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);

            let channel = await this.channelsService.getChannelById(dto.channelId);
            const userToPunish = await this.usersService.getUserByNickname(dto.nickname);
            const punishmentType = dto.punishmentType;
            const date = dto.date;
            const targetSocket = await getSocketsByUser(userToPunish, this.usersMap);

            await this.channelsService.applyPunishment(channel, user, userToPunish, punishmentType, date);
            await sendSuccessToClient(socket, 'channelSuccess', 'You have applied a punishment to ' +
                userToPunish.nickname + ' with success');

            if (targetSocket) {
                const channels: Channel[] = await this.channelsService.getChannels();

                await sendSuccessToClient(targetSocket, 'channelError', 'You have been ' +
                    dto.punishmentType + ' by ' + user.nickname + ' in the channel ' + channel.name);
                await this.sendJoinedChannels(targetSocket, channels);
                await this.sendJoinAbleChannels(targetSocket, channels);
                if (punishmentType !== PunishmentType.MUTE)
                    targetSocket.emit('resetCurrent');
            }
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);

            const channel = await this.channelsService.getChannelById(dto.channelId);
            const userToCancel = await this.usersService.getUserByNickname(dto.nickname);
            const punishmentType = dto.punishmentType;

            await this.channelsService.cancelPunishment(channel, user, userToCancel, punishmentType);
            socket.emit('cancelPunishmentSuccess');
            await sendSuccessToClient(socket, 'channelSuccess', 'You have canceled a punishment to ' +
                userToCancel.nickname + ' with success');
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);

            const channel = await this.channelsService.getChannelById(dto.channelId);
            const userToToggle = await this.usersService.getUserByNickname(dto.nickname);
            const giveAdminRole = dto.giveAdminRole;

            await this.channelsService.toggleAdminRole(channel, user, userToToggle, giveAdminRole);

            await sendSuccessToClient(socket, 'channelSuccess', 'You have toggled admin role to ' +
                userToToggle.nickname + ' with success');

            const userToToggleSocket = await getSocketsByUser(userToToggle, this.usersMap);

            if (userToToggleSocket) {
                if (giveAdminRole) {
                    await sendSuccessToClient(userToToggleSocket, 'channelSuccess', 'You have been given admin role in ' + channel.name)
                } else {
                    await sendErrorToClient(userToToggleSocket, 'channelError', 'You have been removed from admin role in ' + channel.name)
                }
            }
        } catch (error) {
            await sendErrorToClient(socket, 'channelError', error);
        }
    }

    /**
     * get a channel who can be sent to a client
     * @param {Channel} channel
     * @param {User} user
     * @returns {any}
     */
    getChannelToSend(channel: Channel, user: User): any {
        const channelToReturn = ({
            id: channel.id,
            name: channel.name,
            channelType: channel.channelType,
            users: channel.users.map(user => ({
                id: user.id,
                nickname: user.nickname,
            })),
            password: this.channelsService.hasPassword(channel),
            messages: this.channelsService.getMessagesForUser(channel, user).map(message => ({
                id: message.id,
                content: message.text,
                userId: message.user.id,
                nickname: message.user.nickname,
                date: message.date,
            })),
        });

        return channelToReturn;
    }
}