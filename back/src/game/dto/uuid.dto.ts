import {IsString} from 'class-validator';
import {IsNotEmpty} from 'class-validator';

export class UuidDto {

    constructor(payload: any) {
        this.uuid = payload.uuid;
    }

    @IsString()
    @IsNotEmpty()
    uuid: string;
}