import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entity/user.entity";

@Entity({name: "bans"})
export class Ban {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column({ type: 'timestamp with time zone', nullable: true })
    endDate: Date;
}