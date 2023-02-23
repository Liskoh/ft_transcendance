import {IsEnum, IsOptional, IsString, MinLength} from "class-validator";
import {MIN_CHANNEL_NAME_LENGTH} from "../../consts";
import {ChannelType} from "../enum/channel-type.enum";

export class CreateChannelDto {
    constructor(payload: any) {
        this.name = payload.name;
        this.channelType = payload.channelType;
        this.password = payload.password;
    }

    @IsString()
    @IsOptional()
    @MinLength(MIN_CHANNEL_NAME_LENGTH)
    name?: string;

    @IsEnum(ChannelType)
    channelType: ChannelType;

    @IsString()
    @IsOptional()
    password?: string;
}