import {IsDate} from "class-validator";

export class DateDto {
    constructor(date: any) {
        this.date = date;
    }

    @IsDate()
    date: Date;
}