import {PunishmentType} from "../enum/punishment-type.enum";
import {IsDate, IsEnum, IsNumber, IsOptional, Min} from "class-validator";

export class CancelPunishmentDto {
    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.userId = payload.userId;
        this.punishmentType = payload.punishmentType;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsNumber()
    @Min(1)
    userId: number;

    @IsEnum(PunishmentType)
    punishmentType: PunishmentType;
}