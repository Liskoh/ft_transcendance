import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
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
import {UsersService} from "../../users/service/users.service";
import * as bcrypt from 'bcrypt';
import {BCRYPT_SALT_ROUNDS, MAX_CHANNELS_PER_USER} from "../../consts";
import {SetNameDto} from "../dto/set-name.dto";


@Injectable()
export class ChannelsService {

    constructor(@InjectRepository(Channel)
                private channelsRepository: Repository<Channel>,
                @InjectRepository(Message)
                private messagesRepository: Repository<Message>,
                @InjectRepository(Ban)
                private bansRepository: Repository<Ban>,
                @InjectRepository(Mute)
                private mutesRepository: Repository<Mute>,
                private readonly usersService: UsersService) {
    }

    /**
     * Get all channels
     * @returns {Promise<Channel[]>}
     **/
    async getChannels(): Promise<Channel[]> {
        return await this.channelsRepository.find();
    }

    /**
     * Get channels by id
     * @param {number} id
     * @returns {Promise<Channel>}
     */
    async getChannelById(id: number): Promise<Channel> {
        const channel = await this.channelsRepository.findOneBy({id: id});

        if (!channel)
            throw new HttpException(
                'Channel not found',
                HttpStatus.NOT_FOUND
            );

        return channel;
    }

    /**
     * create private channels with another user
     * @param {User} user1
     * @param {User} user2
     * @returns {Promise<Channel>}
     */
    async createDirectMessageChannel(user1: User, user2: User): Promise<Channel> {

        if (this.isDirectChannelExist(user1, user2, await this.getChannels()))
            throw new HttpException(
                'This DM already exist',
                HttpStatus.FORBIDDEN
            );

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
     * create and return channels
     * @param {User} owner
     * @param {ChannelType} type
     * @param {string} name?
     * @returns {Promise<Channel>}
     */
    async createChannel(owner: User, type: ChannelType, name?: string): Promise<Channel> {
        let channel = new Channel();

        // if (this.usersService.getChannelCount(owner) >= MAX_CHANNELS_PER_USER)
        //     throw new HttpException(
        //         'You have reached the maximum number of channels',
        //         HttpStatus.FORBIDDEN
        //     );

        if (!name) {
            name = owner.login + "'s channel";
        }

        const dto = new SetNameDto(name);

        try {
            await validate(dto);
        } catch (e) {
            throw new HttpException(
                e,
                HttpStatus.BAD_REQUEST
            );
        }

        channel.owner = owner;
        channel.name = name;
        channel.users = [owner];
        channel.channelType = type;
        channel.messages = [];
        channel.mutes = [];
        channel.bans = [];

        return await this.channelsRepository.save(channel);
    }

    /**
     * change the channels type between public and private
     * @param {Channel} channel
     * @param {User} owner
     * @param {ChannelType} type
     * @returns {Promise<Channel>}
     */
    async changeChannelType(channel: Channel, owner: User, type: ChannelType): Promise<Channel> {
        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not do this in DM',
                HttpStatus.BAD_REQUEST
            );

        channel.channelType = type.toString();

        return await this.channelsRepository.save(channel);
    }

    /**
     * change the channels password using DTO validation
     * @param channel
     * @param owner
     * @param password
     * @returns {Promise<Channel>}
     */
    async setChannelPassword(channel: Channel, owner: User, password: string): Promise<Channel> {
        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not do this in DM',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        //remove old password and switch to public channels
        if (!password) {
            channel.password = null;

            return await this.channelsRepository.save(channel);
        }

        //set new password using DTO validation
        const dto = new SetPasswordDto(password);

        try {
            await validate(dto);
            channel.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

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

        //in case 'owner' is not admin
        if (channel.owner !== owner)
            throw new HttpException(
                'You are not owner of this channels',
                HttpStatus.FORBIDDEN
            );

        //in case of user is not in channels
        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channels',
                HttpStatus.BAD_REQUEST
            );

        //in case user is already admin
        if (this.isAdministrator(channel, user))
            throw new HttpException(
                'User is already administrator of this channels',
                HttpStatus.BAD_REQUEST
            );

        channel.admins.push(user.id);

        return await this.channelsRepository.save(channel);
    }

    /**
     * invite someone to channels
     * @param {Channel} channel
     * @param {User} owner
     * @param {User} user
     * @returns {Promise<Channel>}
     */
    async inviteUser(channel: Channel, owner: User, user: User): Promise<Channel> {

        if (channel.channelType !== ChannelType.PRIVATE)
            throw new HttpException(
                'You can not invite someone to public channels',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        if (this.isMember(channel, user))
            throw new HttpException(
                'User is already member of this channels',
                HttpStatus.BAD_REQUEST
            );

        if (this.usersService.isSameUser(owner, user))
            throw new HttpException(
                'You can not invite yourself',
                HttpStatus.BAD_REQUEST
            );

        channel.users.push(user);

        return await this.channelsRepository.save(channel);
    }

    /**
     * mute an user from channels
     * @param {Channel} channel
     * @param {User} owner
     * @param {User} user
     * @param {Date} date? (if null, mute is permanent)
     * @returns {Promise<Channel>}
     */
    async muteUser(channel: Channel, owner: User, user: User, date?: Date): Promise<Channel> {
        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not do this in DM',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        if (this.usersService.isSameUser(owner, user))
            throw new HttpException(
                'You can not mute yourself',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channels',
                HttpStatus.BAD_REQUEST
            );

        if (this.isMuted(channel, user))
            throw new HttpException(
                'User is already muted',
                HttpStatus.BAD_REQUEST
            );

        const mute = new Mute(user, date);
        channel.mutes.push(mute);

        await this.mutesRepository.save(mute);

        return await this.channelsRepository.save(channel);
    }

    /**
     * unmute an user from channels
     * @param {Channel} channel
     * @param {User} owner
     * @param {User} user
     * @returns {Promise<Channel>}
     */
    async unmuteUser(channel: Channel, owner: User, user: User): Promise<Channel> {
        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channels',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isMuted(channel, user))
            throw new HttpException(
                'User is not muted',
                HttpStatus.BAD_REQUEST
            );

        const mute = channel.mutes.find(mute => mute.user.id === user.id);

        await this.mutesRepository.remove(mute);

        return await this.channelsRepository.save(channel);
    }


    /**
     * ban an user from channels
     * @param {Channel} channel
     * @param {User} owner
     * @param {User} user
     * @param {Date} date? (if null, ban is permanent)
     * @returns {Promise<Channel>}
     */
    async banUser(channel: Channel, owner: User, user: User, date?: Date): Promise<Channel> {
        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not do this in DM',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        if (this.usersService.isSameUser(owner, user))
            throw new HttpException(
                'You can not ban yourself',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channels',
                HttpStatus.BAD_REQUEST
            );

        if (this.isBanned(channel, user))
            throw new HttpException(
                'User is already banned',
                HttpStatus.BAD_REQUEST
            );

        const ban = new Ban(user, date);
        channel.bans.push(ban);

        //kick user from channel
        channel = await this.kickUser(channel, owner, user);

        return await this.channelsRepository.save(channel);
    }

    /**
     * unban an user from channels
     * @param {Channel} channel
     * @param {User} owner
     * @param {User} user
     * @returns {Promise<Channel>}
     */
    async unbanUser(channel: Channel, owner: User, user: User): Promise<Channel> {
        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channels',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isBanned(channel, user))
            throw new HttpException(
                'User is not banned',
                HttpStatus.BAD_REQUEST
            );

        const ban = channel.bans.find(ban => ban.user.id === user.id);

        await this.bansRepository.remove(ban);

        return await this.channelsRepository.save(channel);
    }

    async kickUser(channel: Channel, owner: User, user: User): Promise<Channel> {
        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not do this in DM',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channels',
                HttpStatus.FORBIDDEN
            );

        if (this.usersService.isSameUser(owner, user))
            throw new HttpException(
                'You can not kick yourself',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channels',
                HttpStatus.BAD_REQUEST
            );

        channel.users = channel.users.filter(u => u.id !== user.id);

        return await this.channelsRepository.save(channel);
    }

    async joinChannel(channel: Channel, user: User, password?: string): Promise<Channel> {

        if (channel.channelType === ChannelType.DM)
            throw new HttpException(
                'You can not join DM',
                HttpStatus.BAD_REQUEST
            );

        if (this.isMember(channel, user))
            throw new HttpException(
                'You are already member of this channels',
                HttpStatus.BAD_REQUEST
            );

        if (this.isBanned(channel, user))
            throw new HttpException(
                'You are banned from this channels',
                HttpStatus.BAD_REQUEST
            );

        //in case of channels has password
        if (this.hasPassword(channel)) {
            const dto = new SetPasswordDto(password);

            try {
                await validate(dto)
            } catch (e) {
                throw new HttpException(
                    'Password is required',
                    HttpStatus.BAD_REQUEST
                );
            }

            if (!bcrypt.compareSync(password, channel.password))
                throw new HttpException(
                    'Wrong password',
                    HttpStatus.FORBIDDEN
                );

            channel.users.push(user);
            return await this.channelsRepository.save(channel);
        }

        //in case of channels is private
        if (channel.channelType === ChannelType.PRIVATE) {
            if (!this.isInvited(channel, user))
                throw new HttpException(
                    'You are not invited to this channels',
                    HttpStatus.FORBIDDEN
                );

            channel.users.push(user);
            channel.invites = channel.invites.filter(id => id !== user.id);

            return await this.channelsRepository.save(channel);
        }

        //in case of channels is public
        channel.users.push(user);

        if (this.isInvited(channel, user)) {
            channel.invites = channel.invites.filter(id => id !== user.id);
        }

        return await this.channelsRepository.save(channel);
    }

    /**
     * send message to channels
     * @param {Channel} channel
     * @param {User} user
     * @param {string} text
     * @returns {Promise<Channel>}
     */
    async sendMessage(channel: Channel, user: User, text: string): Promise<Channel> {
        if (!this.isMember(channel, user))
            throw new HttpException(
                'You are not member of this channels',
                HttpStatus.FORBIDDEN
            );

        if (this.isMuted(channel, user))
            throw new HttpException(
                'You are muted in this channels',
                HttpStatus.FORBIDDEN
            );

        const message = new Message(user, text);
        channel.messages.push(message);

        await this.messagesRepository.save(message);

        return await this.channelsRepository.save(channel);
    }

    /*
     * NON ASYNC METHODS
     */

    /**
     * check if user is administrator of channels
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
     * check if channels is private
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
     * check if user is invited to channels
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isInvited(channel: Channel, user: User): boolean {
        return channel.invites.includes(user.id);
    }

    /**
     * check if channels has password
     * @param channel
     * @returns {boolean}
     */
    hasPassword(channel: Channel): boolean {
        return channel.password ? true : false;
    }

    /**
     * check if user is member of channels
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isMember(channel: Channel, user: User): boolean {
        return channel.users.includes(user);
    }

    /**
     * check if user is banned in channels
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
     * check if user is muted in channels
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
     * check if a direct channels already exist
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

    /**
     * check if channel is direct channel
     * @param {Channel} channel
     * @returns {boolean}
     */
    isDirectChannel(channel: Channel): boolean {
        return channel.channelType === ChannelType.DM;
    }


}