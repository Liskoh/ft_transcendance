import {Module} from "@nestjs/common";
import {ChannelsService} from "./service/channels.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entity/channel.entity";
import {Message} from "./entity/message.entity";
import {UsersModule} from "../users/users.module";
import {Punishment} from "./entity/punishment.entity";

// import {Message} from "./entity/message.entity";

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
    controllers: [],
    providers: [ChannelsService]
})
export class ChannelsModule {
}
