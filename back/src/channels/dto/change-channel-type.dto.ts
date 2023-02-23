import {MIN_CHANNEL_NAME_LENGTH} from "../../consts";
import {ChannelType} from "../enum/channel-type.enum";
import {IsEnum, IsNumber, Min} from "class-validator";

export class ChangeChannelTypeDto {
    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.channelType = payload.channelType;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsEnum(ChannelType)
    channelType: ChannelType;
}