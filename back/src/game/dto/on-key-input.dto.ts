import {IsNotEmpty, IsBoolean, IsNumber, IsString, Matches, MaxLength, MinLength} from "class-validator";

export class OnKeyInputDto {

    constructor(key: string, pressed: boolean) {
        this.key = key;
        this.pressed = pressed;
    }

    @IsString()
    @IsNotEmpty()
    key: string;

    @IsBoolean()
    pressed: boolean;
}