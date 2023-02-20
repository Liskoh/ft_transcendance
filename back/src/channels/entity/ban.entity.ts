import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entity/user.entity";

@Entity({name: "bans"})
export class Ban {

    constructor(user: User, endDate: Date) {
        this.user = user;
        this.endDate = endDate;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column({ type: 'timestamp with time zone', nullable: true })
    endDate: Date;
}