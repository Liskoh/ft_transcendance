import {IsNotEmpty, IsNumber, IsString, Matches, MaxLength, Min, MinLength} from "class-validator";
import {MAX_LOGIN_LENGTH, MAX_MESSAGE_LENGTH, MIN_LOGIN_LENGTH, MIN_MESSAGE_LENGTH} from "../../consts";

export class SendDirectMessageDto {

    constructor(payload: any) {
        this.nickname = payload.nickname;
        this.text = payload.text;
    }

    @IsString()
    @IsNotEmpty()
    @MinLength(MIN_LOGIN_LENGTH)
    @MaxLength(MAX_LOGIN_LENGTH)
    @Matches(/^[a-zA-Z0-9]+$/, {message: "Login can contain only letters and numbers"})
    nickname: string;

    @IsString()
    @MinLength(MIN_MESSAGE_LENGTH)
    @MaxLength(MAX_MESSAGE_LENGTH)
    text: string;

}