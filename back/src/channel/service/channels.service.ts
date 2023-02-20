import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "../entity/channel.entity";
import {User} from "../../users/entity/user.entity";
import {ChannelType} from "../enum/channel-type.enum";
import {SetPasswordDto} from "../dto/set-password.dto";
import {validate} from "class-validator";
import {Message} from "../entity/message.entity";


@Injectable()
export class ChannelsService {

    constructor(@InjectRepository(Channel)
                private channelsRepository: Repository<Channel>) {
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
     * create and return channel
     * @param {User} owner
     * @param {ChannelType} type
     * @returns {Promise<Channel>}
     */
    async createChannel(owner: User, type: ChannelType): Promise<Channel> {
        let channel = new Channel();

        channel.owner = owner;
        channel.users = [owner];
        channel.channelType = type.toString();
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

        const message = new Message(user, text);
        channel.messages.push(message);

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
     * check if user is member of channel
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isMember(channel: Channel, user: User): boolean {
        return channel.users.includes(user);
    }


}