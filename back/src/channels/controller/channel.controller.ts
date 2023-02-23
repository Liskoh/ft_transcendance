import {Controller, Get} from "@nestjs/common";
import {ChannelsService} from "../service/channels.service";

@Controller('channels')
export class ChannelController {

    constructor(
        private readonly channelsService: ChannelsService,
    ) {}

    @Get()
    async getChannels() : Promise<any> {
        return await this.channelsService.getChannels();
    }

}