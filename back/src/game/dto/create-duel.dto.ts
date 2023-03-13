import {IsNotEmpty, IsString, Matches, MaxLength, MinLength, IsEnum} from "class-validator";
import {MAX_LOGIN_LENGTH, MAX_SIZE_LOGIN_ERROR, MIN_LOGIN_LENGTH} from "../../consts";
import {GameLevel} from "../enum/game-level.enum";
import {PunishmentType} from "../../channel/enum/punishment-type.enum";

export class CreateDuelDto {

    constructor(payload: any) {
        this.login = payload.login;
        this.gameLevel = GameLevel[payload.gameLevel.toUpperCase()];
    }

    @IsString()
    @IsNotEmpty()
    @MinLength(MIN_LOGIN_LENGTH)
    @MaxLength(MAX_LOGIN_LENGTH)
    @Matches(/^[a-zA-Z0-9]+$/, {message: "Login can contain only letters and numbers"})
    login: string;

    @IsEnum(GameLevel)
    gameLevel: GameLevel;
}