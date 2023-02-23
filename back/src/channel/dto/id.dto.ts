import {IsNumber, Min} from "class-validator";

export class IdDto {
    constructor(id: any) {
        this.id = id;
    }

    @IsNumber()
    @Min(1)
    id: number;
}