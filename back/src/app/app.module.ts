import "reflect-metadata"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {AppController} from "./controller/app.controller";
import {AppService} from "./service/app.service";
import {User} from "../users/entity/user.entity";
import {UsersModule} from "../users/users.module";
import {DatabaseModule} from "../db/database.module";
import {Channel} from "diagnostics_channel";
import {ChannelsModule} from "../channels/channels.module";
import {GameModule} from "../game/game.module";
@Module({
    imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        UsersModule,
        ChannelsModule,
        GameModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
