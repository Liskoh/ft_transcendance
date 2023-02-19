import "reflect-metadata"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {AppController} from "./controller/app.controller";
import {AppService} from "./service/app.service";
import {Post} from "../entity/Post";
import {Category} from "../entity/Category";
import {User} from "../users/entity/user.entity";
import {UsersModule} from "../users/users.module";
import {DatabaseModule} from "../db/database.module";
import {Channel} from "diagnostics_channel";
import {ChannelsModule} from "../channel/channels.module";
@Module({
    imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        UsersModule,
        ChannelsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
