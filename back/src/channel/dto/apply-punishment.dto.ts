import {PunishmentType} from "../enum/punishment-type.enum";
import {IsDate, IsEnum, IsNumber, IsOptional, Min} from "class-validator";

export class ApplyPunishmentDto {
    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.userId = payload.userId;
        this.punishmentType = payload.punishmentType;
        this.date = payload.date;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsNumber()
    @Min(1)
    userId: number;

    @IsEnum(PunishmentType)
    punishmentType: PunishmentType;

    @IsOptional()
    @IsDate()
    date?: Date;
}