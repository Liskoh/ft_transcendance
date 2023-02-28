import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserService} from "../user/service/user.service";
import {JwtService} from "@nestjs/jwt";
import {LoginNicknameDto} from "../user/dto/login-nickname.dto";
import {User} from "../user/entity/user.entity";


@Injectable()
export class Auth42Service {

    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService) {}

    async validateUser(login: string): Promise<boolean> {
        let user: User;

        try {
            user = await this.userService.getUserByLogin(login);
        } catch (error) {
            user = await this.userService.saveNewUser(new LoginNicknameDto(login));
        }
        return true;
    }

    async login(login: string) {
        let user: User;

        try {
            user = await this.userService.getUserByLogin(login);
        } catch (error) {
            return new HttpException(
                'user does not exist',
                HttpStatus.NOT_FOUND);
        }

        const payload = { username: user.login, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        }
    }
}
