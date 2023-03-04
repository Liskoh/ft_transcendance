import {PunishmentType} from "../enum/punishment-type.enum";
import {IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min} from "class-validator";

export class CancelPunishmentDto {
    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.nickname = payload.nickname;
        this.punishmentType = PunishmentType[payload.punishmentType.toUpperCase()];
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsEnum(PunishmentType)
    punishmentType: PunishmentType;
}