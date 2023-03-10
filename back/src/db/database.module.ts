import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {POSTGRES_NAME, TYPEORM_ENTITIES} from "../consts";
import * as process from "process";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env'
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: POSTGRES_NAME,
				host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                synchronize: true,
                logging: false,
                entities: TYPEORM_ENTITIES,
                subscribers: [],
                migrations: [],
            }),
            inject: [ConfigService],
        })
    ]
})
export class DatabaseModule {
}