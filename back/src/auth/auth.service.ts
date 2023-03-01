import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserService} from "../user/service/user.service";
import {JwtService} from "@nestjs/jwt";
import {LoginNicknameDto} from "../user/dto/login-nickname.dto";
import {User} from "../user/entity/user.entity";


@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService) {}

    async register(login: string): Promise<any> {
        let user: User;
        console.log(login);
        try {
            user = await this.userService.getUserByLogin(login);
        } catch (error) {
            user = await this.userService.saveNewUser(new LoginNicknameDto(login));
            const payload = { username: user.login, sub: user.id };
            return {
                access_token: this.jwtService.sign(payload),
            }
        }

        return new HttpException(
            'user already exist',
            HttpStatus.BAD_REQUEST
        );

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

     signJwt(login: string, sub: number): string {
        const payload = { username: login, sub: sub };
        return this.jwtService.sign(payload);
    }

    verifyJwt(token: string): any {
        return this.jwtService.verify(token);
    }
}