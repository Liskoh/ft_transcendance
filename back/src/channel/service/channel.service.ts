import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "../entity/channel.entity";
import {ChannelType} from "../enum/channel-type.enum";
import {SetPasswordDto} from "../dto/set-password.dto";
import {validate, validateOrReject} from "class-validator";
import {Message} from "../entity/message.entity";
import {UserService} from "../../user/service/user.service";
import * as bcrypt from 'bcrypt';
import {
    BCRYPT_SALT_ROUNDS,
    CHAT_COOLDOWN_IN_MILLISECONDS, MAX_CHANNELS_PER_USER,
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH
} from "../../consts";
import {SetNameDto} from "../dto/set-name.dto";
import {PunishmentType} from "../enum/punishment-type.enum";
import {Punishment} from "../entity/punishment.entity";
import {User} from "src/user/entity/user.entity";


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

    async saveChannel(channel: Channel): Promise<Channel> {
        return await this.channelsRepository.save(channel);
    }

    /**
     * create private channel with another user
     * @param {User} user1
     * @param {User} user2
     * @param {Channel[]} channels
     * @returns {Promise<Channel>}
     */
    async createDirectMessageChannel(user1: User, user2: User, channels: Channel[]): Promise<Channel> {

        // if (this.isDirectChannelExist(user1, user2, await this.getChannels()))
        //     throw new HttpException(
        //         'This DM already exist',
        //         HttpStatus.FORBIDDEN
        //     );
        let channel = this.getDirectChannel(user1, user2, channels);

        if (channel)
            throw new HttpException(
                'This DM already exist',
                HttpStatus.FORBIDDEN
            );

        channel = new Channel(user1, ChannelType.DM);

        channel.name = user1.login + " & " + user2.login;
        channel.owner = user1;
        channel.users = [user1, user2];

        return await this.channelsRepository.save(channel);
    }

    async getAvailableChannelsByUser(user: User): Promise<Channel[]> {
        let channels = await this.getChannels();
        channels = channels.filter(c => c.channelType === ChannelType.PUBLIC &&
            !this.isMember(c, user) &&
            !this.isPunished(c, user, PunishmentType.BAN));

        return channels;
    }

    async getJoinedChannelsByUser(user: User): Promise<Channel[]> {
        let channels = await this.getChannels();
        channels = channels.filter(c => this.isMember(c, user) &&
            !this.isPunished(c, user, PunishmentType.BAN));

        return channels;
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

        const channels: Channel[] = await this.channelsRepository
            .createQueryBuilder("channel")
            .leftJoinAndSelect("channel.owner", "owner")
            .where("owner.id = :userId", {userId: owner.id})
            .getMany();

        if (channels.length >= MAX_CHANNELS_PER_USER)
            throw new HttpException(
                'You have reached the maximum number of channels',
                HttpStatus.FORBIDDEN
            );

        if (!name)
            name = owner.login + "'s channel";

        channel.name = name;
        channel.owner = owner;
        channel.users = [owner];
        channel.messages = [];
        channel.punishments = [];
        channel.channelType = type;

        if (password) {
            // console.log("password: " + password);
            channel.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        }

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
        if (!this.isOwner(channel, owner))
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

        const myB: boolean = giveAdminRole;

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

        // if (channel.channelType !== ChannelType.PRIVATE)
        //     throw new HttpException(
        //         'You can not invite someone to public channel',
        //         HttpStatus.BAD_REQUEST
        //     );

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

        if (!this.isOwner(channel, user) && this.isAdministrator(channel, user))
            throw new HttpException(
                'You can not punish administrator',
                HttpStatus.BAD_REQUEST
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
                punishment.endDate !== null &&
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
                await validateOrReject(dto);
            } catch (e) {
                throw new HttpException(
                    'password must be between ' +
                    MIN_PASSWORD_LENGTH + ' and ' +
                    MAX_PASSWORD_LENGTH + ' characters long',
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
     * send direct message to user
     * @param {User} sender
     * @param {User} receiver
     * @param {string} text
     * @returns {Promise<User[]>}
     */
    async sendDirectMessage(sender: User, receiver: User, text: string): Promise<User []> {
        const channels = await this.getChannels();
        let channel = this.getDirectChannel(sender, receiver, channels);

        if (!channel) {
            channel = await this.createDirectMessageChannel(sender, receiver, channels);
        }

        return await this.sendMessage(channel, sender, text);
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

        if (this.isPunished(channel, user, PunishmentType.BAN) || this.isPunished(channel, user, PunishmentType.KICK))
            throw new HttpException(
                'You are punished in this channel',
                HttpStatus.FORBIDDEN
            );

        const coolDownTime: number = this.getCoolDownTime(user.id);

        if (coolDownTime > 0) {
            const seconds = Math.floor(coolDownTime / 1000);
            const milliseconds = coolDownTime - seconds * 1000;
            throw new HttpException(
                'You must wait ' + seconds + '.' + milliseconds +
                ' seconds before sending another message',
                HttpStatus.FORBIDDEN
            );
        }

        const message = new Message(user, text);
        channel.messages.push(message);

        await this.messagesRepository.save(message);
        await this.channelsRepository.save(channel);

        //return filtered user if blocked etc...
        return channel.users.filter(u => !u.blockedList.includes(user.id));
    }

    getMessagesForUser(channel: Channel, user: User): Message[] {
        const messages = channel.messages;

        return messages.filter(m =>
            !user.blockedList.includes(m.user.id));
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
        if (channel.password)
            return true;

        return false;
    }

    /**
     * check if user is member of channel
     * @param {Channel} channel
     * @param {User} user
     * @returns {boolean}
     */
    isMember(channel: Channel, user: User): boolean {
        for (const u of channel.users)
            if (u.id === user.id)
                return true;
        return false;
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
    getDirectChannel(user1: User, user2: User, channels: Channel[]): Channel {
        return channels.find(channel => {
            if (channel.channelType === ChannelType.DM) {
                if (channel.users.includes(user1) && channel.users.includes(user2)) {
                    return channel;
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

    getCoolDownTime(userId: number): number {
        const lastMessage = this.coolDownMap.get(userId);
        const now = new Date();
        if (lastMessage) {
            const diff = now.getTime() - lastMessage.getTime();
            if (diff < CHAT_COOLDOWN_IN_MILLISECONDS) {
                return CHAT_COOLDOWN_IN_MILLISECONDS - diff;
            }
        }
        this.coolDownMap.set(userId, now);
        return 0;
    }

    isOnCoolDown(userId: number): boolean {
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