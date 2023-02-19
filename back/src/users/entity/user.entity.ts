import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Channel} from "../../channel/entity/channel.entity";


@Entity({name: "users"})
export class User {

    constructor(login: string) {
        this.login = login;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column( {unique: true, length: 8} )
    login: string;

    @Column('int', { array: true, default: [] })
    friendsList: number[];

    @Column('int', { array: true, default: [] })
    pendingFriendRequests: number[];

    @Column('int', { array: true, default: [] })
    blockedList: number[];

    // @OneToMany(type => Match, (match) => match.winner)
    // wins: Match[];
    //
    // @OneToMany(type => Match, (match) => match.looser)
    // losses: Match[];

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
    //     if (channel.users.includes(userId)) {
    //         // throw new Error("You are already in this channel");
    //         return;
    //     }
    //
    //     channel.users.push(userId);
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

