import {Module} from "@nestjs/common";
import {ChannelsService} from "./service/channels.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entity/channel.entity";
// import {Message} from "./entity/message.entity";

@Module({
    exports: [ChannelsService],
    imports: [TypeOrmModule.forFeature([Channel])],
    controllers: [],
    providers: [ChannelsService]
})
export class ChannelsModule {}
