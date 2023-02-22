import {OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {IdDto} from "../dto/id.dto";
import {ChannelsService} from "../service/channels.service";
import {SendMessageDto} from "../dto/send-message.dto";
import {UsersService} from "../../users/service/users.service";
import {User} from "../../users/entity/user.entity";
import {Channel} from "../entity/channel.entity";
import {validate, ValidationError} from "class-validator";
import {DateDto} from "../dto/date.dto";
import {JoinChannelDto} from "../dto/join-channel.dto";
import {ApplyPunishmentDto} from "../dto/apply-punishment.dto";
import {CancelPunishmentDto} from "../dto/cancel-punishment.dto";

@WebSocketGateway()
export class ChannelGateway implements OnGatewayConnection {

    constructor(
        private readonly channelsService: ChannelsService,
        private readonly usersService: UsersService,
    ) {
    }

    @WebSocketServer()
    server: Server;

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

    @SubscribeMessage('getChannel')
    async getChannel(socket: Socket, payload: IdDto): Promise<any> {
        try {
            await validate(payload);

            const channel = await this.channelsService.getChannelById(payload.id);

            socket.emit('getChannelSuccess', channel);
        } catch (error) {
            if (error instanceof ValidationError) {
                socket.emit('getChannelValidationFailed', error);
            } else {
                socket.emit('getChannelFailed', error);
            }
        }
    }

    /*
     * send a socket message to all users in a channel
     * @param {Channel} channel
     * @param {string} type
     * @param {any} payload
     * returns {void}
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

            await this.channelsService.sendMessage(channel, user, payload.text);

            //TODO: Send message to all users in channel
            // await this.sendChannelMessage(channel, 'newMessage', {
            //     userId: user.id,
            //     userLogin: user.login,
            //     text: dto.text,
            // });

            socket.emit('sendMessageSuccess');
        } catch (error) {
            if (error instanceof ValidationError) {
                socket.emit('sendMessageValidationFailed', error);
            } else {
                socket.emit('sendMessageFailed', error);
            }
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

            if (payload.password) {
                await this.channelsService.joinChannel(channel, user, payload.password);
            } else {
                await this.channelsService.joinChannel(channel, user);
            }

            socket.emit('joinChannelSuccess');
        } catch (error) {
            if (error instanceof ValidationError) {
                socket.emit('joinChannelValidationFailed', error);
            } else {
                socket.emit('joinChannelFailed', error);
            }
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

            //TODO: Send message to all users in channel
        } catch (error) {
            if (error instanceof ValidationError) {
                socket.emit('leaveChannelValidationFailed', error);
            } else {
                socket.emit('leaveChannelFailed', error);
            }
        }
    }

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
            if (error instanceof ValidationError) {
                socket.emit('applyPunishmentValidationFailed', error);
            } else {
                socket.emit('applyPunishmentFailed', error);
            }
        }
    }

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
            if (error instanceof ValidationError) {
                socket.emit('cancelPunishmentValidationFailed', error);
            } else {
                socket.emit('cancelPunishmentFailed', error);
            }
        }
    }

}