import {IsNotEmpty, IsString, MaxLength} from "class-validator";
import {MAX_LOGIN_LENGTH, MAX_SIZE_LOGIN_ERROR} from "../../consts";

export class ChangeNicknameDto {

    constructor(login: string) {
        this.login = login;
    }

    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_LOGIN_LENGTH, {message: MAX_SIZE_LOGIN_ERROR})
    login: string;
}