import {Controller, Get} from "@nestjs/common";
import {UserService} from "../service/user.service";

@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UserService,
    ) {}

    @Get()
    async getUsers() : Promise<any> {
        return this.usersService.getUsers();
    }
}