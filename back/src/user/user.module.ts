import {forwardRef, Module} from "@nestjs/common";
import {UserService} from "./service/user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entity/user.entity";
import {UserGateway} from "./gateway/user.gateway";
import {UsersController} from "./controller/users.controller";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {AuthModule} from "../auth/auth.module";
import {AuthService} from "../auth/auth.service";

@Module({
    exports: [UserService],
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([User])
    ],
    controllers: [UsersController],
    providers: [
        UserService,
        UserGateway,
    ]
})
export class UserModule {}
