import {IsString, MaxLength, MinLength} from "class-validator";
import {MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH} from "../../consts";

export class SetPasswordDto {

    constructor(password: string) {
        this.password = password;
    }

    @IsString()
    @MinLength(MIN_PASSWORD_LENGTH)
    @MaxLength(MAX_PASSWORD_LENGTH)
    password: string;
}