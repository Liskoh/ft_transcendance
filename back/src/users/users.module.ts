import {Module} from "@nestjs/common";
import {UsersService} from "./service/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entity/user.entity";
import {UserGateway} from "./gateway/user.gateway";
import {UsersController} from "./controller/users.controller";

@Module({
    exports: [UsersService],
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [UsersService, UserGateway]
})
export class UsersModule {}
