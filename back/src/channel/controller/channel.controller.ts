import {Controller, Get} from "@nestjs/common";
import {ChannelService} from "../service/channel.service";

@Controller('channels')
export class ChannelController {

    constructor(
        private readonly channelsService: ChannelService,
    ) {}

    @Get()
    async getChannels() : Promise<any> {
        return await this.channelsService.getChannels();
    }

}