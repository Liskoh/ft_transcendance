import {forwardRef, Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import AuthController from './auth.controller';
import {UserModule} from 'src/user/user.module';
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./jwt.strategy";
import {APP_GUARD} from "@nestjs/core";
import {GoogleStrategy} from "./google.strategy";

@Module({
    imports: [
        forwardRef(() => UserModule),
        // UserModule,
        JwtModule.register({
            secret: 'secret',
            signOptions: {expiresIn: '1d'},
        }),
        PassportModule
    ],
    providers: [
        AuthService,
        GoogleStrategy,
        JwtStrategy,
        {
            provide: APP_GUARD,
            useClass: JwtStrategy,
        }
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {
}
