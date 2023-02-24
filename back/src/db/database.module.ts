import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {POSTGRES_NAME, TYPEORM_ENTITIES} from "../consts";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env'
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: POSTGRES_NAME,
                //host: "localhost",
				host: "postgres",
                //port: 5432,
                username: "postgres",
                password: "secret",
                database: "test",
                /*
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    username: configService.get<string>('DB_USER'),
                    password: configService.get<string>('DB_PASSWORD'),
                    database: configService.get<string>('DB_NAME'),
                 */
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