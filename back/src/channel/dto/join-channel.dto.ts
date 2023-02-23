import { IsNumber, IsOptional, IsString } from 'class-validator';

export class JoinChannelDto {

    constructor(payload: any) {
        this.id = payload.id;
        this.password = payload.password;
    }


    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    password?: string;
}