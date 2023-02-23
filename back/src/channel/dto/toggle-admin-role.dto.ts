import {IsBoolean, IsEnum, IsNumber, Min} from "class-validator";
import {PunishmentType} from "../enum/punishment-type.enum";

export class ToggleAdminRoleDto {

    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.userId = payload.userId;
        this.giveAdminRole = payload.giveAdminRole;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsNumber()
    @Min(1)
    userId: number;

    @IsBoolean()
    giveAdminRole: boolean;

}