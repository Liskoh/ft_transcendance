import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../user/entity/user.entity";

@Entity({name: "match_histories"})
export class MatchHistory {

        constructor() {
        }

        @PrimaryGeneratedColumn()
        id: number;

        @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
        @JoinColumn()
        firstUser: User;

        @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
        @JoinColumn()
        secondUser: User;

        @Column({default: 0})
        firstPlayerScore: number;

        @Column({default: 0})
        secondPlayerScore: number;

        @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
        @JoinColumn()
        winner: User;

        @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
        @JoinColumn()
        loser: User;

        @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
        date: Date;
}