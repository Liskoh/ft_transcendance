import {IsNumber, Min} from "class-validator";

export class GetChannelDto {
    constructor(id: any) {
        this.id = id;
    }

    @IsNumber()
    @Min(1)
    id: number;
}