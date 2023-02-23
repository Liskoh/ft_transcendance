import {Module} from "@nestjs/common";
import {ChannelService} from "./service/channel.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entity/channel.entity";
import {Message} from "./entity/message.entity";
import {UserModule} from "../user/user.module";
import {Punishment} from "./entity/punishment.entity";
import {ChannelGateway} from "./gateway/channel.gateway";
import {ChannelController} from "./controller/channel.controller";


@Module({
    exports: [ChannelService],
    imports: [
        TypeOrmModule.forFeature(
            [
                Channel,
                Message,
                Punishment,
                ]
        ),
        UserModule
    ],
    controllers: [ChannelController],
    providers: [ChannelService, ChannelGateway]
})
export class ChannelModule {
}
