import {PunishmentType} from "../enum/punishment-type.enum";
import {IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min} from "class-validator";

export class InviteUserDto {
    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.nickname = payload.nickname;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsString()
    @IsNotEmpty()
    nickname: string;
}