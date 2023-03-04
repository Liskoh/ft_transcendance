import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, Min} from "class-validator";
import {PunishmentType} from "../enum/punishment-type.enum";

export class ToggleAdminRoleDto {

    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.nickname = payload.nickname;
        this.giveAdminRole = payload.giveAdminRole;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsBoolean()
    giveAdminRole: boolean;

}