import {Module} from "@nestjs/common";
import {ChannelService} from "./service/channel.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entity/channel.entity";
import {Message} from "./entity/message.entity";
import {UserModule} from "../user/user.module";
import {Punishment} from "./entity/punishment.entity";
import {ChannelGateway} from "./gateway/channel.gateway";
import {ChannelController} from "./controller/channel.controller";
import {AuthModule} from "../auth/auth.module";
import {GameModule} from "../game/game.module";


@Module({
    exports: [ChannelService],
    imports: [
        AuthModule,
        TypeOrmModule.forFeature(
            [
                Channel,
                Message,
                Punishment,
                ]
        ),
        UserModule,
        GameModule
    ],
    controllers: [ChannelController],
    providers: [ChannelService, ChannelGateway]
})
export class ChannelModule {
}
