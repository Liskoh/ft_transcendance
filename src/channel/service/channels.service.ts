import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "../entity/channel.entity";
import {User} from "../../users/entity/user.entity";


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
     * @returns {Promise<Channel>}
     */
    async createChannel(owner: User): Promise<Channel> {
        let channel = new Channel();

        channel.owner = owner;
        channel.users = [owner];
        channel.messages = [];

        return await this.channelsRepository.save(channel);
    }


}