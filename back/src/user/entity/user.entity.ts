import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Channel} from "../../channel/entity/channel.entity";
import {MatchHistory} from "../../game/entity/match-history.entity";
import {UserStatus} from "../enum/user-status.enum";


@Entity({name: "users"})
export class User {

    // constructor(login: string) {
    //     this.login = login;
    // }

    constructor(login: string) {
        this.login = login;
        this.nickname = this.login;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column( {unique: true, length: 8} )
    login: string;

    @Column( {unique: true} )
    nickname: string;

    @Column({default: UserStatus.OFFLINE})
    status: UserStatus;

    @Column('int', { array: true, default: [] })
    friendsList: number[];

    @Column('int', { array: true, default: [] })
    pendingFriendRequests: number[];

    @Column('int', { array: true, default: [] })
    blockedList: number[];

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    firstLogin: Date;

    @ManyToMany(type => Channel, channel => channel.users)
    @JoinTable()
    channels: Channel[];


    /* ************************************
        *
        * FUNCTIONS
        *
     ************************************ */

    // async joinChannel(channel: ChannelEntity, password?: string) {
    //     let userId = this.id;
    //
    //     if (channel.user.includes(userId)) {
    //         // throw new Error("You are already in this channel");
    //         return;
    //     }
    //
    //     channel.user.push(userId);
    //     await AppDataSource.manager.save(channel);
    //
    //     console.log("UserEntity " + this.login + " joined channel " + channel.id);
    // }
    //
    // async sendMessageToChannel(text: string, channel: ChannelEntity) {
    //     const messageObj = new MessageEntity();
    //
    //     messageObj.user = this;
    //     messageObj.text = text;
    //
    //     await AppDataSource.manager.save(messageObj);
    //
    //     channel.messages.push(messageObj.id);
    //
    //     await AppDataSource.manager.save(channel);
    // }
    //
    //
    // async acceptFriendRequest(from: UserEntity) {
    //     if (this.id === from.id) {
    //         // throw new Error("You can't accept friend request from yourself");
    //         return;
    //     }
    //
    //     if (!from.pendingFriendRequests.includes(this.id)) {
    //         // throw new Error("You don't have friend request from this user");
    //         return;
    //     }
    //
    //     if (from.friendsList.includes(this.id)) {
    //         // throw new Error("You are already friends with this user");
    //         return;
    //     }
    //
    //     //add to friends list
    //     from.friendsList.push(this.id);
    //     this.friendsList.push(from.id);
    //
    //     //remove pending friend requests
    //     from.pendingFriendRequests.splice(from.pendingFriendRequests.indexOf(this.id), 1);
    //
    //     await AppDataSource.manager.save(from);
    //     await AppDataSource.manager.save(this);
    // }

}
