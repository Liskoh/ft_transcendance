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

@Entity({name: "channels"})
export class Channel {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    owner: User;

    @ManyToMany(type => Message, {eager: true})
    @JoinTable()
    messages: Message[];

    @ManyToMany(type => User, user => user.channels, { eager: true, cascade: true})
    users: User[];

    @Column('varchar')
    channelType: string;

    @Column('text', {nullable: true, default: null })
    password: string;

    @Column('int', { array: true, default: [] })
    adminsId: number[];

}

