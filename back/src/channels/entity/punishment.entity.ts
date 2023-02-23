import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entity/user.entity";
import {PunishmentType} from "../enum/punishment-type.enum";

@Entity({name: "punishments"})
export class Punishment {

    constructor(user: User, punishmentType: PunishmentType, endDate?: Date) {
        this.user = user;
        this.endDate = endDate;
        this.punishmentType = punishmentType;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column('varchar')
    punishmentType: string;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;
}