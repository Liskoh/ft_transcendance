import {Controller, Get} from "@nestjs/common";
import {ChannelService} from "../service/channel.service";
import {UserService} from "../../user/service/user.service";

@Controller('channels')
export class ChannelController {

    constructor(
        private readonly channelsService: ChannelService,
        private readonly usersService: UserService,
    ) {
    }

    @Get()
    async getChannels(): Promise<any> {
        const channels = await this.channelsService.getChannels();

        // return channels;
        return channels.map(channel => ({
            id: channel.id,
            name: channel.name,
            password: channel.password !== null,
            channelType: channel.channelType,
        }))
    }

    @Get('me')
    async getMyChannels(): Promise<any> {
        const user = await this.usersService.getUserById(1);
        const channels = await this.channelsService.getJoinedChannelsByUser(user);

        console.log("dsfsfsdfsdf " + user.id);
        // return channels;
        return channels.map(channel => ({
            id: channel.id,
            name: channel.name,
            password: channel.password !== null,

            users: channel.users.map(user => ({
                id: user.id,
                login: user.login,
                nickname: user.nickname,
                status: user.status,
            })),

            channelType: channel.channelType,
        }))
    }

}