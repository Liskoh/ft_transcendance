import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserService} from "../user/service/user.service";
import {JwtService} from "@nestjs/jwt";
import {LoginNicknameDto} from "../user/dto/login-nickname.dto";
import {User} from "../user/entity/user.entity";
import {Socket} from "socket.io";


@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService) {
    }

    async getUserByWebSocket(client: Socket): Promise<User> {
        const authorization = client.handshake.headers.authorization;
        const token: string = authorization && authorization.split(' ')[1];
        const tokenError = new HttpException(
            'Invalid token',
            HttpStatus.UNAUTHORIZED
        );
        console.log(client.handshake.headers);
        if (!token)
            throw tokenError;

        console.log('token= ' + token);
        const payload = this.verifyJwt(token);

        if (!payload)
            throw tokenError;

        console.log('payload= ' + payload);
        let user;

        try {
            user = await this.userService.getUserById(payload.sub);
        } catch (error) {
            throw error;
        }

        return user;
    }


    async verifyJWTFromSocket(socket: Socket): Promise<any> {
        const token = socket.handshake.headers.authorization?.split(' ')[1];

        if (!token)
            throw new HttpException(
                'No token provided',
                HttpStatus.UNAUTHORIZED
            );

        const decoded = await this.verifyJwt(token);

        if (!decoded)
            throw new HttpException(
                'Invalid token',
                HttpStatus.UNAUTHORIZED
            );

        return decoded;
    }

	async intra(user: User) {
		if (user) {
            const payload = {username: user.login, sub: user.id};
            return {
                status: HttpStatus.OK,
                access_token: this.jwtService.sign(payload),
            }
        }
		const payload = {username: user.login, sub: user.id};
		return {
			status: HttpStatus.OK,
			access_token: this.jwtService.sign(payload),
		}
	}

    async register(login: string): Promise<any> {
        let user: User;
        console.log(login);
        try {
            user = await this.userService.getUserByLogin(login);
        } catch (error) {
            user = await this.userService.saveNewUser(login);
            const payload = {username: user.login, sub: user.id};
            return {
                status: HttpStatus.OK,
                access_token: this.jwtService.sign(payload),
            }
        }

        if (user) {
            const payload = {username: user.login, sub: user.id};
            return {
                status: HttpStatus.OK,
                access_token: this.jwtService.sign(payload),
            }
        }
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

        const payload = {username: user.login, sub: user.id};
        return {
            status: HttpStatus.OK,
            access_token: this.jwtService.sign(payload),
        }
    }

    signJwt(login: string, sub: number): string {
        const payload = {username: login, sub: sub};
        return this.jwtService.sign(payload);
    }

    verifyJwt(token: string): any {
        try {
            return this.jwtService.verify(token);
        } catch (e) {
            return null;
        }
    }
}
