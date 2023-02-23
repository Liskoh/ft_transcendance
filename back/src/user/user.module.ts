import {Module} from "@nestjs/common";
import {UserService} from "./service/user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entity/user.entity";
import {UserGateway} from "./gateway/user.gateway";
import {UsersController} from "./controller/users.controller";

@Module({
    exports: [UserService],
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [UserService, UserGateway]
})
export class UserModule {}
