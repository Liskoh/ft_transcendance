import {
    Column,
    Entity, JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne,
    PrimaryGeneratedColumn,
    TableInheritance
} from "typeorm";
import {User} from "../../users/entity/user.entity";
import {Message} from "./message.entity";
import {MAX_PASSWORD_LENGTH} from "../../consts";
import {Ban} from "./ban.entity";
import {Mute} from "./mute.entity";
import {ChannelType} from "../enum/channel-type.enum";
import {channel} from "diagnostics_channel";

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

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    owner: User;

    @ManyToMany(type => User, user => user.channels, { eager: true, cascade: true})
    users: User[];

    @ManyToMany(type => Message, {eager: true})
    @JoinTable()
    messages: Message[];

    @ManyToMany(type => Ban, {eager: true})
    @JoinTable()
    bans: Ban[];

    @ManyToMany(type => Mute, {eager: true})
    @JoinTable()
    mutes: Mute[];

    @Column('varchar')
    channelType: string;

    @Column('text', {nullable: true, default: null })
    password: string;

    @Column('int', { array: true, default: [] })
    admins: number[];

    @Column('int', { array: true, default: [] })
    invites: number[];

}

