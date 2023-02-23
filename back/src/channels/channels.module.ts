import {Module} from "@nestjs/common";
import {ChannelsService} from "./service/channels.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entity/channel.entity";
import {Message} from "./entity/message.entity";
import {UsersModule} from "../users/users.module";
import {Punishment} from "./entity/punishment.entity";
import {ChannelGateway} from "./gateway/channel.gateway";
import {ChannelController} from "./controller/channel.controller";


@Module({
    exports: [ChannelsService],
    imports: [
        TypeOrmModule.forFeature(
            [
                Channel,
                Message,
                Punishment,
                ]
        ),
        UsersModule
    ],
    controllers: [ChannelController],
    providers: [ChannelsService, ChannelGateway]
})
export class ChannelsModule {
}
