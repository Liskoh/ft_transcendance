import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "../entity/channel.entity";
import {User} from "../../users/entity/user.entity";
import {ChannelType} from "../enum/channel-type.enum";
import {SetPasswordDto} from "../dto/set-password.dto";
import {validate} from "class-validator";


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
        // channel.messages = [];

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

        return channel.adminsId.includes(user.id);
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


}