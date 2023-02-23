import {IsNumber} from "class-validator";

export class LeaveChannelDto {
    @IsNumber()
    id: number;
}