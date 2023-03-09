import {Injectable, NestMiddleware, HttpException, HttpStatus} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Request, Response, NextFunction} from 'express';
import {AuthService} from "./auth.service";
import {UserService} from "../user/service/user.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new HttpException('Missing authorization header', HttpStatus.UNAUTHORIZED);
        }

        const bearer = authHeader.split(' ')[0];
        const token = authHeader.split(' ')[1];

        if (bearer !== 'Bearer' || !token) {
            throw new HttpException('Invalid authorization header', HttpStatus.UNAUTHORIZED);
        }

        let decoded;
        try {
            decoded = this.authService.verifyJwt(token);
        } catch (err) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }

        const login = decoded.username;
        if (!login) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }

        try {
            req.user = await this.userService.getUserByLogin(login);
            next();
        } catch (err) {
            console.log('User not found');
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
    }
}
