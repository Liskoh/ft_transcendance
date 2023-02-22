import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entity/user.entity";
import {Message} from "./message.entity";
import {Punishment} from "./punishment.entity";

@Entity({name: "channels"})
export class Channel {

    // constructor(owner: User, type: ChannelType) {
    //     this.owner = owner;
    //     this.users = [owner];
    //     this.channelType = type;
    //     this.messages = [];
    //     // this.bans = [];
    //     // this.mutes = [];
    //     this.admins = [];
    // }

    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    name: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    owner: User;

    @ManyToMany(type => User, user => user.channels, { eager: true, cascade: true})
    users: User[];

    @ManyToMany(type => Message, {eager: true})
    @JoinTable()
    messages: Message[];

    @ManyToMany(type => Punishment, {eager: true})
    @JoinTable()
    punishments: Punishment[];

    @Column('varchar')
    channelType: string;

    @Column('text', {nullable: true, default: null })
    password: string;

    @Column('int', { array: true, default: [] })
    admins: number[];

    @Column('int', { array: true, default: [] })
    invites: number[];

}

