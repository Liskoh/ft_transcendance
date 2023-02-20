import {IsEmail, IsNotEmpty, IsString, MaxLength} from "class-validator";
import {MAX_LOGIN_LENGTH, MAX_SIZE_LOGIN_ERROR} from "../../consts";

export class RegisterUserDto {

    constructor(login: string, email: string) {
        this.login = login;
        this.email = email;
    }


    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_LOGIN_LENGTH, {message: MAX_SIZE_LOGIN_ERROR})
    login: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}