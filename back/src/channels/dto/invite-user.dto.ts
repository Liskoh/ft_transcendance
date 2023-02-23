import {PunishmentType} from "../enum/punishment-type.enum";
import {IsDate, IsEnum, IsNumber, IsOptional, Min} from "class-validator";

export class InviteUserDto {
    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.userId = payload.userId;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsNumber()
    @Min(1)
    userId: number;
}