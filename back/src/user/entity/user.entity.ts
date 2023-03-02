import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Channel} from "../../channel/entity/channel.entity";
import {MatchHistory} from "../../game/entity/match-history.entity";
import {UserStatus} from "../enum/user-status.enum";
import {MAX_LOGIN_LENGTH} from "../../consts";


@Entity({name: "users"})
export class User {

    constructor(login: string) {
        this.login = login;
        this.nickname = this.login;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column( {unique: true, length: 8} )
    login: string;

    @Column( {unique: true})
    nickname: string;

    @Column({default: UserStatus.OFFLINE})
    status: UserStatus;

    @Column('int', { array: true, default: [] })
    friendsList: number[];

    @Column('int', { array: true, default: [] })
    blockedList: number[];

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    firstLogin: Date;

    @ManyToMany(type => Channel, channel => channel.users)
    @JoinTable()
    channels: Channel[];

}

