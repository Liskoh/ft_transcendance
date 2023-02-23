import {IsNotEmpty, IsString, Matches, MaxLength, MinLength} from "class-validator";
import {MAX_LOGIN_LENGTH, MAX_SIZE_LOGIN_ERROR, MIN_LOGIN_LENGTH} from "../../consts";

export class LoginNicknameDto {

    constructor(login: string) {
        this.login = login;
    }

    @IsString()
    @IsNotEmpty()
    @MinLength(MIN_LOGIN_LENGTH)
    @MaxLength(MAX_LOGIN_LENGTH)
    @Matches(/^[a-zA-Z0-9]+$/, {message: "Login can contain only letters and numbers"})
    login: string;
}