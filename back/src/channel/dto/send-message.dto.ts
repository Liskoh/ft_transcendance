import {IsNumber, IsString, MaxLength, Min, MinLength} from "class-validator";
import {MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH} from "../../consts";

export class SendMessageDto {

    constructor(payload: any) {
        this.channelId = payload.channelId;
        this.text = payload.text;
    }

    @IsNumber()
    @Min(1)
    channelId: number;

    @IsString()
    @MinLength(MIN_MESSAGE_LENGTH)
    @MaxLength(MAX_MESSAGE_LENGTH)
    text: string;

}