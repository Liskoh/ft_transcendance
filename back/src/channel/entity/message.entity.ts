import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entity/user.entity";

@Entity({name: "messages"})
export class Message {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column('text')
    text: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

}

