import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "../entity/channel.entity";
import {User} from "../../user/entity/user.entity";
import {ChannelType} from "../enum/channel-type.enum";
import {SetPasswordDto} from "../dto/set-password.dto";
import {validate} from "class-validator";
import {Message} from "../entity/message.entity";
import {UserService} from "../../user/service/user.service";
import * as bcrypt from 'bcrypt';
import {BCRYPT_SALT_ROUNDS, CHAT_COOLDOWN_IN_MILLISECONDS} from "../../consts";
import {SetNameDto} from "../dto/set-name.dto";
import {PunishmentType} from "../enum/punishment-type.enum";
import {Punishment} from "../entity/punishment.entity";


@Injectable()
export class ChannelService {

    constructor(@InjectRepository(Channel)
                private channelsRepository: Repository<Channel>,
                @InjectRepository(Message)
                private messagesRepository: Repository<Message>,
                @InjectRepository(Punishment)
                private punishmentsRepository: Repository<Punishment>,
                private readonly usersService: UserService) {
    }

    private coolDownMap = new Map<number, Date>();

    /**
     * Get all channel
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
        const channel = await this.channelsRepository.findOneBy({id: id});

        if (!channel)
            throw new HttpException(
                'Channel not found',
                HttpStatus.NOT_FOUND
            );

        return channel;
    }

    //TODO: check version typeorm and fix this
    /**
     * Get channel by id with filtered data (for socket)
     * @param {number} id
     * @param {string[]} requiredFields
     * @returns {Promise<Channel>}
     */
    // async getFilteredChannelById(id: number, select: string[]): Promise<Channel> {
    //
    //     // const options = { select };
    //     // this.channelsRepository.
    //     // const channel = await this.channelsRepository.findOne({ id }, {
    //     //     password: false,
    //     //     punishments: false
    //     // });
    //     //
    //     // if (!channel)
    //     //     throw new HttpException(
    //     //         'Channel not found',
    //     //         HttpStatus.NOT_FOUND
    //     //     );
    //     //
    //     // return channel;
    // }

    /**
     * create private channel with another user
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

        let channel = new Channel(user1, ChannelType.DM);

        channel.name = user1.login + " & " + user2.login;
        channel.owner = user1;
        channel.users = [user1, user2];

        return await this.channelsRepository.save(channel);
    }

    /**
     * create and return channel
     * @param {User} owner
     * @param {ChannelType} type
     * @param {string} name? (optional)
     * @param {string} password? (optional)
     * @returns {Promise<Channel>}
     */
    async createChannel(owner: User, type: ChannelType, name?: string, password?: string): Promise<Channel> {
        let channel = new Channel(owner, type);

        // if (this.usersService.getChannelCount(owner) >= MAX_CHANNELS_PER_USER)
        //     throw new HttpException(
        //         'You have reached the maximum number of channel',
        //         HttpStatus.FORBIDDEN
        //     );

        if (!name)
            name = owner.login + "'s channel";

        channel.name = name;
        channel.owner = owner;
        channel.users = [owner];
        channel.messages = [];
        channel.punishments = [];
        channel.channelType = type;

        if (password)
            channel.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

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
        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channel',
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
     * change the channel password using DTO validation
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
                'You are not administrator of this channel',
                HttpStatus.FORBIDDEN
            );

        //remove old password and switch to public channel
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
     * @param {boolean} giveAdminRole
     * @returns {Promise<Channel>}
     */
    async toggleAdminRole(channel: Channel, owner: User, user: User, giveAdminRole: boolean): Promise<Channel> {

        //in case 'owner' is not admin
        if (channel.owner !== owner)
            throw new HttpException(
                'You are not owner of this channel',
                HttpStatus.FORBIDDEN
            );

        //in case of user is not in channel
        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channel',
                HttpStatus.BAD_REQUEST
            );

        //in case user is already admin and we want to give him admin role
        if (this.isAdministrator(channel, user) && giveAdminRole)
            throw new HttpException(
                'User is already administrator of this channel',
                HttpStatus.BAD_REQUEST
            );

        //in case user is not admin and we want to remove admin role
        if (!this.isAdministrator(channel, user) && !giveAdminRole)
            throw new HttpException(
                'User is not administrator of this channel',
                HttpStatus.BAD_REQUEST
            );

        if (giveAdminRole)
            channel.admins.push(user.id);
        else
            channel.admins = channel.admins.filter(id => id !== user.id);

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

        if (channel.channelType !== ChannelType.PRIVATE)
            throw new HttpException(
                'You can not invite someone to public channel',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channel',
                HttpStatus.FORBIDDEN
            );

        if (this.isMember(channel, user))
            throw new HttpException(
                'User is already member of this channel',
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

    async applyPunishment(channel: Channel, owner: User, user: User, punishmentType: PunishmentType, date?: Date): Promise<Channel> {
        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not do this in DM',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channel',
                HttpStatus.FORBIDDEN
            );

        if (this.usersService.isSameUser(owner, user))
            throw new HttpException(
                'You can not punish yourself',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channel',
                HttpStatus.BAD_REQUEST
            );

        //if its kick we can execute it directly and return
        if (punishmentType === PunishmentType.KICK) {
            return this.kickUser(channel, owner, user);
        }

        if (this.isPunished(channel, user, punishmentType))
            throw new HttpException(
                'User is already punished',
                HttpStatus.BAD_REQUEST
            );

        let punishment = new Punishment(user, punishmentType, date);

        //save punishment
        channel.punishments.push(punishment);
        await this.punishmentsRepository.save(punishment);

        return await this.channelsRepository.save(channel);
    }

    async cancelPunishment(channel: Channel, owner: User, user: User, punishmentType: PunishmentType): Promise<Channel> {
        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not do this in DM',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isAdministrator(channel, owner))
            throw new HttpException(
                'You are not administrator of this channel',
                HttpStatus.FORBIDDEN
            );

        if (this.usersService.isSameUser(owner, user))
            throw new HttpException(
                'You can not cancel punishment for yourself',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'User is not member of this channel',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isPunished(channel, user, punishmentType))
            throw new HttpException(
                'User is not punished',
                HttpStatus.BAD_REQUEST
            );

        //in case if the punishment is permanent (we have to remove it)
        let punishment = channel.punishments.find(
            punishment => punishment.user.id === user.id &&
                punishment.punishmentType === punishmentType &&
                punishment.endDate === null &&
                punishmentType !== PunishmentType.KICK
        );

        if (!punishment)
            throw new HttpException(
                'User has no such punishment',
                HttpStatus.BAD_REQUEST
            );

        await this.punishmentsRepository.remove(punishment);

        return await this.channelsRepository.save(channel);
    }

    async kickUser(channel: Channel, owner: User, user: User): Promise<Channel> {
        //verification is effectuated in this.applyPunishment method
        channel.users = channel.users.filter(u => u.id !== user.id);
        return await this.channelsRepository.save(channel);
    }

    async leaveChannel(channel: Channel, user: User): Promise<Channel> {
        if (this.isDirectChannel(channel))
            throw new HttpException(
                'You can not leave DM',
                HttpStatus.BAD_REQUEST
            );

        if (!this.isMember(channel, user))
            throw new HttpException(
                'You are not member of this channel',
                HttpStatus.BAD_REQUEST
            );

        channel.users = channel.users.filter(u => u.id !== user.id);

        //in case of user is owner of channel
        if (this.isOwner(channel, user)) {
            if (channel.users.length > 0) {
                channel.owner = channel.users[0];
            } else {
                return this.channelsRepository.remove(channel);
            }
        }

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
                'You are already member of this channel',
                HttpStatus.BAD_REQUEST
            );

        if (this.isPunished(channel, user, PunishmentType.BAN))
            throw new HttpException(
                'You are banned from this channel',
                HttpStatus.BAD_REQUEST
            );

        //in case of channel has password
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

        //in case of channel is private
        if (channel.channelType === ChannelType.PRIVATE) {
            if (!this.isInvited(channel, user))
                throw new HttpException(
                    'You are not invited to this channel',
                    HttpStatus.FORBIDDEN
                );

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
     * @returns {Promise<User[]>}
     */
    async sendMessage(channel: Channel, user: User, text: string): Promise<User []> {
        if (!this.isMember(channel, user))
            throw new HttpException(
                'You are not member of this channel',
                HttpStatus.FORBIDDEN
            );

        //check if user is muted
        if (this.isPunished(channel, user, PunishmentType.MUTE))
            throw new HttpException(
                'You are muted in this channel',
                HttpStatus.FORBIDDEN
            );

        if (this.isPunished(channel, user, PunishmentType.BAN))
            throw new HttpException(
                'You are banned in this channel',
                HttpStatus.FORBIDDEN
            );

        if (this.isOnCooldown(user.id))
            throw new HttpException(
                'You must wait before sending another message',
                HttpStatus.FORBIDDEN
            );

        const message = new Message(user, text);
        channel.messages.push(message);

        await this.messagesRepository.save(message);
        await this.channelsRepository.save(channel);

        //return filtered user if blocked etc...
        return channel.users.filter(u => !u.blockedList.includes(user.id));
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

    isPunished(channel: Channel, user: User, punishmentType: PunishmentType): boolean {
        const currentDate = new Date();

        const punishments = channel.punishments.filter(
            punish => punish.user.id === user.id &&
                punish.punishmentType === punishmentType &&
                punish.punishmentType !== PunishmentType.KICK
        );

        //in case punish is permanent or active
        for (const punish of punishments)
            if (punish.user.id === user.id && punish.punishmentType === punishmentType)
                if (punish.endDate === null || punish.endDate > currentDate)
                    return true;

        return false
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

    /**
     * check if channel is direct channel
     * @param {Channel} channel
     * @returns {boolean}
     */
    isDirectChannel(channel: Channel): boolean {
        return channel.channelType === ChannelType.DM;
    }


    isOwner(channel: Channel, user: User) {
        return channel.owner.id === user.id;
    }

    isOnCooldown(userId: number): boolean {
        const lastMessage = this.coolDownMap.get(userId);
        const now = new Date();

        if (lastMessage) {
            const diff = now.getTime() - lastMessage.getTime();
            if (diff < CHAT_COOLDOWN_IN_MILLISECONDS) {
                return true;
            }
        }
        this.coolDownMap.set(userId, now);
        return false;
    }
}