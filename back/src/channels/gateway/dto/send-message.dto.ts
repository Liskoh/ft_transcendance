import {IsNumber, IsString, MaxLength, Min, MinLength} from "class-validator";
import {MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH} from "../../../consts";

export class SendMessageDto {

    constructor(payload: any) {
        this.id = payload.id;
        this.text = payload.text;
    }

    @IsNumber()
    @Min(1)
    id: number;

    @IsString()
    @MinLength(MIN_MESSAGE_LENGTH)
    @MaxLength(MAX_MESSAGE_LENGTH)
    text: string;

}