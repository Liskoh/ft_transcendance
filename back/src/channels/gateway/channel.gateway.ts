import {OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {IdDto} from "./dto/id.dto";
import {ChannelsService} from "../service/channels.service";
import {SendMessageDto} from "./dto/send-message.dto";
import {UsersService} from "../../users/service/users.service";
import {User} from "../../users/entity/user.entity";
import {Channel} from "../entity/channel.entity";
import {validate} from "class-validator";
import {DateDto} from "./dto/date.dto";

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
    async handleConnection(socket: Socket, ...args: any[]): Promise<any> {
        try {
            socket.data.user = await this.usersService.getUserById(1);
        } catch (ex) {
            console.log(ex);
        }
    }

    @SubscribeMessage('getChannels')
    async getChannels(socket: Socket, payload: any): Promise<any> {

    }

    @SubscribeMessage('getChannel')
    async getChannel(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new IdDto(payload);
            const channel = await this.channelsService.getChannelById(dto.id);

            socket.emit('getChannel',
                {
                    id: channel.id,
                    users: channel.users,
                    messages: channel.messages,
                });
        } catch (ex) {
            console.log(ex);
        }
    }

    @SubscribeMessage('sendMessage')
    async sendMessage(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new SendMessageDto(payload);
            const channel = await this.channelsService.getChannelById(dto.id);
            const user = socket.data.user;

            await this.channelsService.sendMessage(channel, user, dto.text);

            //TODO: Send message to all users in channel
            await this.sendChannelMessage(channel, 'newMessage', {
                userId: user.id,
                userLogin: user.login,
                text: dto.text,
            });
        } catch (ex) {
            console.log(ex);
        }
    }

    /**
     * Join a channel with a password or without
     * @param {Socket} socket
     * @param {any} payload => {id: number, password?: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('joinChannel')
    async joinChannel(socket: Socket, payload: any): Promise<any> {
        try {
            const channelDto = new IdDto(payload);
            await validate(channelDto);

            const channel = await this.channelsService.getChannelById(channelDto.id);
            const user = socket.data.user;

            if (payload.password) {
                await this.channelsService.joinChannel(channel, user, payload.password);
                return;
            }

            await this.channelsService.joinChannel(channel, user);
            //TODO: Send message to all users in channel
        } catch (ex) {
            console.log(ex);
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
            const user = socket.data.user;

            const channelDto = new IdDto(payload);
            await validate(channelDto);

            const channel = await this.channelsService.getChannelById(channelDto.id);

            await this.channelsService.leaveChannel(channel, user);

            //TODO: Send message to all users in channel
        } catch (ex) {

        }
    }

    /**
     * mute an user from a channel
     * @param {Socket} socket
     * @param {any} payload => {channelId: number, userId: number, date?: Date}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('muteUser')
    async muteUser(socket: Socket, payload: any): Promise<any> {
        try {
            const user = socket.data.user;

            const dtoChannel = new IdDto(payload.channelId);
            const dtoUser = new IdDto(payload.userId);
            const dtoDate = new DateDto(payload.date);

            await validate(dtoChannel);
            await validate(dtoUser);

            const channel = await this.channelsService.getChannelById(dtoChannel.id);
            const userToMute = await this.usersService.getUserById(dtoUser.id);

            if (payload.date === undefined) {
                await this.channelsService.muteUser(channel, user, userToMute);
            } else {
                await validate(dtoDate);
                await this.channelsService.muteUser(channel, user, userToMute, dtoDate.date);
            }

        } catch (ex) {
            console.log(ex);
        }
    }

    @SubscribeMessage('unmuteUser')
    async unmuteUser(socket: Socket, payload: any): Promise<any> {
        try {
            const user = socket.data.user;

            const dtoChannel = new IdDto(payload.channelId);
            const dtoUser = new IdDto(payload.userId);

            await validate(dtoChannel);
            await validate(dtoUser);

            const channel = await this.channelsService.getChannelById(dtoChannel.id);
            const userToUnmute = await this.usersService.getUserById(dtoUser.id);

            await this.channelsService.unmuteUser(channel, user, userToUnmute);
        } catch (ex) {
            console.log(ex);
        }
    }

    /**
     * Ban an user from a channel
     * @param {Socket} socket
     * @param {any} payload => {channelId: number, userId: number, date?: Date}
     */
    @SubscribeMessage('banUser')
    async banUser(socket: Socket, payload: any): Promise<any> {
        try {
            const user = socket.data.user;

            const dtoChannel = new IdDto(payload.channelId);
            const dtoUser = new IdDto(payload.userId);
            const dtoDate = new DateDto(payload.date);

            await validate(dtoChannel);
            await validate(dtoUser);

            const channel = await this.channelsService.getChannelById(dtoChannel.id);
            const userToBan = await this.usersService.getUserById(dtoUser.id);

            if (payload.date === undefined) {
                await this.channelsService.banUser(channel, user, userToBan);
            } else {
                await validate(dtoDate);
                await this.channelsService.banUser(channel, user, userToBan, dtoDate.date);
            }

        } catch (ex) {
            console.log(ex);
        }
    }

    @SubscribeMessage('unbanUser')
    async unbanUser(socket: Socket, payload: any): Promise<any> {
        try {
            const user = socket.data.user;

            const dtoChannel = new IdDto(payload.channelId);
            const dtoUser = new IdDto(payload.userId);

            await validate(dtoChannel);
            await validate(dtoUser);

            const channel = await this.channelsService.getChannelById(dtoChannel.id);
            const userToUnban = await this.usersService.getUserById(dtoUser.id);

            await this.channelsService.unbanUser(channel, user, userToUnban);
        } catch (ex) {
            console.log(ex);
        }
    }

    @SubscribeMessage('kickUser')
    async kickUser(socket: Socket, payload: any): Promise<any> {
        try {
            const user = socket.data.user;

            const dtoChannel = new IdDto(payload.channelId);
            const dtoUser = new IdDto(payload.userId);

            await validate(dtoChannel);
            await validate(dtoUser);

            const channel = await this.channelsService.getChannelById(dtoChannel.id);
            const userToKick = await this.usersService.getUserById(dtoUser.id);

            await this.channelsService.kickUser(channel, user, userToKick);
        } catch (ex) {
            console.log(ex);
        }
    }

    //TODO: Implement
    async sendChannelMessage(channel: Channel, event: string, args: any): Promise<any> {
        try {
            if (!channel.users)
                return;

            for (const user of channel.users) {

            }
        } catch (ex) {
            console.log(ex);
        }
    }


}