import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {POSTGRES_NAME, TYPEORM_ENTITIES} from "../consts";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: POSTGRES_NAME,
                host: "localhost",
                port: 5432,
                username: "postgres",
                password: "password",
                database: "test",
                synchronize: true,
                logging: true,
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