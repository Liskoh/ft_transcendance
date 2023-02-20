import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "match_histories"})
export class MatchHistory {

        @PrimaryGeneratedColumn()
        id: number;


}