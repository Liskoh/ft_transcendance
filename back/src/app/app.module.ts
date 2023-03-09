import "reflect-metadata"
import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {AppController} from "./controller/app.controller";
import {AppService} from "./service/app.service";
import {User} from "../user/entity/user.entity";
import {UserModule} from "../user/user.module";
import {DatabaseModule} from "../db/database.module";
import {Channel} from "diagnostics_channel";
import {ChannelModule} from "../channel/channel.module";
import {GameModule} from "../game/game.module";
import { AuthModule } from "src/auth/auth.module"
import {JwtModule} from "@nestjs/jwt";
import {JwtMiddleware} from "../auth/jwt.middleware";
@Module({
    imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        UserModule,
        ChannelModule,
        GameModule,
		AuthModule,
        JwtModule,
    ],
    controllers: [AppController],
    providers: [AppService, JwtMiddleware],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(JwtMiddleware)
            .forRoutes('users', 'channels', 'games');
    }
}
