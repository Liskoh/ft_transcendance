import {IsEmail, IsNotEmpty, IsString, Matches, MaxLength} from "class-validator";
import {MAX_LOGIN_LENGTH, MAX_SIZE_LOGIN_ERROR} from "../../consts";

export class RegisterUserDto {

    constructor(login: string) {
        this.login = login;
    }


    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_LOGIN_LENGTH, {message: MAX_SIZE_LOGIN_ERROR})
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'Login should contain only letters and numbers' })
    login: string;
}