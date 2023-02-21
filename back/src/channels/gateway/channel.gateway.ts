import {OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {GetChannelDto} from "./dto/get-channel.dto";
import {ChannelsService} from "../service/channels.service";
import {SendMessageDto} from "./dto/send-message.dto";
import {UsersService} from "../../users/service/users.service";
import {User} from "../../users/entity/user.entity";
import {Channel} from "../entity/channel.entity";

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

    @SubscribeMessage('getChannel')
    async getChannel(socket: Socket, payload: any): Promise<any> {
        try {
            const dto = new GetChannelDto(payload);
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