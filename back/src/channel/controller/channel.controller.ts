import {Controller, Get} from "@nestjs/common";
import {ChannelService} from "../service/channel.service";

@Controller('channels')
export class ChannelController {

    constructor(
        private readonly channelsService: ChannelService,
    ) {}

    @Get()
    async getChannels() : Promise<any> {
        const channels = await this.channelsService.getChannels();

        return channels.map(channel => ({
            id: channel.id,
            name: channel.name,
            channelType: channel.channelType,
        }))
    }

}