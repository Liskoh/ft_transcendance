import {IsEmail, IsNotEmpty, IsString, Matches, MaxLength} from "class-validator";
import {MAX_LOGIN_LENGTH, MAX_SIZE_LOGIN_ERROR} from "../../consts";

export class RegisterUserDto {

    constructor(login: string, email: string) {
        this.login = login;
        this.email = email;
    }


    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_LOGIN_LENGTH, {message: MAX_SIZE_LOGIN_ERROR})
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'Login should contain only letters and numbers' })
    login: string;

    @IsEmail(undefined, { message: 'Invalid email address' })
    @IsNotEmpty()
    email: string;
}