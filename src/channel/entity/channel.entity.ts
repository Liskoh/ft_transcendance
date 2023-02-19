import {
    Column,
    Entity, JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne,
    PrimaryGeneratedColumn,
    TableInheritance
} from "typeorm";
import {User} from "../../users/entity/user.entity";


@Entity({name: "channels"})
@TableInheritance({column: {type: "varchar", name: "type"}})
export class Channel {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    owner: User;

    @Column('int', { array: true, default: [] })
    messages: number[];

    @ManyToMany(type => User, user => user.channels)
    users: User[];

    // @ManyToMany(() => MessageEntity)
    // @JoinTable()
    // messages: MessageEntity[];

    // @ManyToMany(() => UserEntity)
    // @JoinTable()
    // blockedUsers: UserEntity[];
    //
    // @ManyToMany(() => UserEntity)
    // @JoinTable()
    // mutedUsers: UserEntity[];



}

