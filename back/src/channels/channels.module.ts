import {Module} from "@nestjs/common";
import {ChannelsService} from "./service/channels.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entity/channel.entity";
import {Message} from "./entity/message.entity";
import {Ban} from "./entity/ban.entity";
import {Mute} from "./entity/mute.entity";
// import {Message} from "./entity/message.entity";

@Module({
    exports: [ChannelsService],
    imports: [TypeOrmModule.forFeature([Channel, Message, Ban, Mute])],
    controllers: [],
    providers: [ChannelsService]
})
export class ChannelsModule {}
