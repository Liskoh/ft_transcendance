import {Module} from "@nestjs/common";
import {UsersService} from "./service/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entity/user.entity";

@Module({
    exports: [UsersService],
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [],
    providers: [UsersService]
})
export class UsersModule {}
