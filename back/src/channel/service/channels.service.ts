import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "../entity/channel.entity";
import {User} from "../../users/entity/user.entity";
import {ChannelType} from "../enum/channel-type.enum";
import {SetPasswordDto} from "../dto/set-password.dto";
import {validate} from "class-validator";
import {Message} from "../entity/message.entity";
import {Ban} from "../entity/ban.entity";
import {Mute} from "../entity/mute.entity";


@Injectable()
export class ChannelsService {

    constructor(@InjectRepository(Channel)
                private channelsRepository: Repository<Channel>,
                @InjectRepository(Message)
                private messagesRepository: Repository<Message>,
                @InjectRepository(Ban)
                private bansRepository: Repository<Ban>,
                @InjectRepository(Mute)
                private mutesRepository: Repository<Mute>) {
    }

    /**
     * Get all channels
     * @returns {Promise<Channel[]>}
     **/
    async getChannels(): Promise<Channel[]> {
        return await this.channelsRepository.find();
    }

    /**
     * Get channel by id
     * @param {number} id
     * @returns {Promise<Channel>}
     */
    async getChannelById(id: number): Promise<Channel> {
        return await this.channelsRepository.findOneBy({id: id});
    }

    /**
     * create private channel with another user
     * @param {User} user1
     * @param {User} user2
     * @returns {Promise<Channel>}
     */
    async createDirectMessageChannel(user1: User, user2: User): Promise<Channel> {

        if (this.isDirectChannelExist(user1, user2, await this.getChannels())) {
            // throw new Error('Direct channel already exist');
            return null;
        }

        let channel = new Channel();

        //TODO: SET IN CONSTRUCTOR
        channel.owner = user1;
        channel.users = [user1, user2];
        channel.channelType = ChannelType.DM;
        channel.messages = [];
        channel.mutes = [];
        channel.bans = [];

        return await this.channelsRepository.save(channel);
    }

    /**
     * create and return channel
     * @param {User} owner
     * @param {ChannelType} type
     * @returns {Promise<Channel>}
     */
    async createChannel(owner: User, type: ChannelType): Promise<Channel> {
        let channel = new Channel();

        channel.owner = owner;
        channel.users = [owner];
        channel.channelType = type;
        channel.messages = [];
        channel.mutes = [];
        channel.bans = [];

        return await this.channelsRepository.save(channel);
    }

    /**
     * change the channel type between public and private
     * @param {Channel} channel
     * @param {User} owner
     * @param {ChannelType} type
     * @returns {Promise<Channel>}
     */
    async changeChannelType(channel: Channel, owner: User, type: ChannelType): Promise<Channel> {
        if (!this.isAdministrator(channel, owner)) {
            // throw new Error('You are not administrator of this channel');
            return null;
        }

        if (type === ChannelType.DM) {
            // throw new Error('You can not change the type to DM');
            return null;
        }

        channel.channelType = type.toString();

        return await this.channelsRepository.save(channel);
    }

    /**
     * change the channel password using DTO validation
     * @param channel
     * @param owner
     * @param password
     * @returns {Promise<Channel>}
     */
    async setChannelPassword(channel: Channel, owner: User, password: string): Promise<Channel> {
        if (!this.isAdministrator(channel, owner)) {
            // throw new Error('You are not administrator of this channel');
            return null;
        }

        //remove old password and switch to public channel
        if (!password) {
            channel.password = null;

            return await this.channelsRepository.save(channel);
        }

        //set new password using DTO validation
        const dto = new SetPasswordDto(password);

        try {
            await validate(dto);
            channel.password = password;

            return await this.channelsRepository.save(channel);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * give the admin role to user
     * @param {Channel} channel
     * @param {User} owner
     * @param {User} user
     * @returns {Promise<Channel>}
     */
    async giveAdminRole(channel: Channel, owner: User, user: User): Promise<Channel> {

        //in case of user is not in channel
        if (!this.isMember(channel, user)) {
            // throw new Error('User is not member of this channel');
            return null;
        }

        //in case user is already admin
        if (this.isAdministrator(channel, user)) {
            // throw new Error('User is already administrator of this channel');
            return null;
        }

        //in case 'owner' is not admin
        if (channel.owner !== owner) {
            // throw new Error('You are not administrator of this channel');
            return null;
        }

        channel.admins.push(user.id);

        return await this.channelsRepository.save(channel);
    }

    /**
     * invite someone to channel
     * @param {Channel} channel
     * @param {User} owner
     * @param {User} user
     * @returns {Promise<Channel>}
     */
    async inviteUser(channel: Channel, owner: User, user: User): Promise<Channel> {

        if (channel.channelType !== ChannelType.PRIVATE) {
            // throw new Error('You can invite only to private channel');
            return null;
        }

        if (!this.isAdministrator(channel, owner)) {
            // throw new Error('You are not administrator of this channel');
            return null;
        }

        if (this.isMember(channel, user)) {
            // throw new Error('User is already member of this channel');
            return null;
        }

        channel.users.push(user);

        return await this.channelsRepository.save(channel);
    }

    async joinChannel(channel: Channel, user: User, password?: string): Promise<Channel> {

        if (channel.channelType === ChannelType.DM) {
            // throw new Error('You can not join to DM channel');
            return null;
        }

        if (this.isMember(channel, user)) {
            // throw new Error('You are already member of this channel');
            return null;
        }

        if (this.isBanned(channel, user)) {
            // throw new Error('You are banned from this channel');
            return null;
        }

        //in case of channel has password
        if (this.hasPassword(channel)) {
            //TODO: HASH PASSWORD
            if (channel.password !== password) {
                // throw new Error('Wrong password');
                return null;
            }

            channel.users.push(user);
            return await this.channelsRepository.save(channel);
        }

        //in case of channel is private
        if (channel.channelType === ChannelType.PRIVATE) {
            if (!this.isInvited(channel, user)) {
                // throw new Error('You are not invited to this channel');
                return null;
            }

            channel.users.push(user);
            channel.invites = channel.invites.filter(id => id !== user.id);

            return await this.channelsRepository.save(channel);
        }

        //in case of channel is public
        channel.users.push(user);

        if (this.isInvited(channel, user)) {
            channel.invites = channel.invites.filter(id => id !== user.id);
        }

        return await this.channelsRepository.save(channel);
    }

    /**
     * send message to channel
     * @param {Channel} channel
     * @param {User} user
     * @param {string} text
     * @returns {Promise<Channel>}
     */
    async sendMessage(channel: Channel, user: User, text: string): Promise<Channel> {
        if (!this.isMember(channel, user)) {
            // throw new Error('You are not member of this channel');
            return null;
        }

        if (this.isMuted(channel, user)) {
            // throw new Error('You are muted in this channel');
            return null;
        }

        const message = new Message(user, text);
        channel.messages.push(message);

        await this.messagesRepository.save(message);

        return await this.channelsRepository.save(channel);
    }

    /*
     * NON ASYNC METHODS
     */

    /**
     * check if user is administrator of channel
     * @param channel
     * @param user
     * @returns {boolean}
     */
    isAdministrator(channel: Channel, user: User): boolean {
        if (channel.owner.id === user.id) {
            return true;
        }

        return channel.admins.includes(user.id);
    }

    /**
     * check if channel is private
     * @param channel
     * @returns {boolean}
     */
    isPrivate(channel: Channel): boolean {
        if (channel.channelType === ChannelType.PRIVATE) {
            return true;
        }

        if (channel.password) {
            return true;
        }

        return false;
    }

    /**
     * check if user is invited to channel
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isInvited(channel: Channel, user: User): boolean {
        return channel.invites.includes(user.id);
    }

    /**
     * check if channel has password
     * @param channel
     * @returns {boolean}
     */
    hasPassword(channel: Channel): boolean {
        return channel.password ? true : false;
    }

    /**
     * check if user is member of channel
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isMember(channel: Channel, user: User): boolean {
        return channel.users.includes(user);
    }

    /**
     * check if user is banned in channel
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isBanned(channel: Channel, user: User): boolean {
        const currentDate = new Date();

        for (const ban of channel.bans) {
            if (ban.user.id === user.id) {
                //in case ban is permanent
                if (ban.endDate === null) {
                    return true;
                }

                //in case ban is temporary
                if (ban.endDate > currentDate) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * check if user is muted in channel
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isMuted(channel: Channel, user: User): boolean {
        const currentDate = new Date();

        for (const mute of channel.mutes) {
            if (mute.user.id === user.id) {
                //in case mute is permanent
                if (mute.endDate === null) {
                    return true;
                }

                //in case mute is temporary
                if (mute.endDate > currentDate) {
                    return true;
                }
            }
        }

        return false;
    }


    /**
     * check if a direct channel already exist
     * @param {User} user1
     * @param {User} user2
     * @param {Channel[]} channels
     * @returns {boolean}
     */
    isDirectChannelExist(user1: User, user2: User, channels: Channel[]): boolean {
        return channels.some(channel => {
            if (channel.channelType === ChannelType.DM) {
                if (channel.users.includes(user1) && channel.users.includes(user2)) {
                    return true;
                }
            }
        });
    }


}