import {IsString, MaxLength, MinLength} from "class-validator";
import {MAX_CHANNEL_NAME_LENGTH, MIN_CHANNEL_NAME_LENGTH} from "../../consts";

export class SetNameDto {
    constructor(name: string) {
        this.name = name;
    }
    @IsString()
    @MinLength(MIN_CHANNEL_NAME_LENGTH)
    @MaxLength(MAX_CHANNEL_NAME_LENGTH)
    name: string;
}