import {IsNumber, Min} from "class-validator";

export class IdDto {
    constructor(payload: any) {
        this.id = payload.id;
    }

    @IsNumber()
    @Min(1)
    id: number;
}