import {Controller, Get, Post, Body, Param, UseGuards, Request, Req, HttpStatus} from "@nestjs/common";
import {CreateAuthDto} from "./dtos/auth.dto";
import {AuthService} from "./auth.service";
import axios, {HttpStatusCode} from "axios";
import {ConfigModule} from "@nestjs/config";
import {UserService} from "src/user/service/user.service";
import {LoginNicknameDto} from "src/user/dto/login-nickname.dto";
import {DisabledAuth} from "./jwt.guard";
import {User} from "src/user/entity/user.entity";
import {ok} from "assert";


@Controller('auth')
export default class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {

    }

    @Get('users')
    async getUsers(): Promise<any> {
        return this.userService.getUsers();
    }

    @Get('verify')
    async verifyJwt(@Request() req): Promise<any> {
        return {
            status: HttpStatus.OK,
            message: "OK"
        }
    }

    @DisabledAuth()
    @Post('register')
    async register(@Request() req): Promise<any> {
        const login = req.body.login;

        if (typeof login !== 'string')
            return;
        console.log(login);
        return this.authService.register(login);
    }

    @DisabledAuth()
    @Post('login')
    async login(@Request() req): Promise<any> {
        const login = req.body.login;
        console.log('request');
        if (typeof login !== 'string')
            return;
        console.log(login);

        return this.authService.login(login);
    }

    @Post('auth')
    createAuth(@Body() createAuthDto: CreateAuthDto) {
        createAuthDto.client_id = "test";
    }

    @Get('intra')
    async connectIntra(@Req() req) {
        try {
            const code = req.query.code
            if (typeof code !== 'string')
                return;
            console.log(code);
            const data = {
                code,
                client_id: '' + process.env.CLIENT_ID,
                client_secret: '' + process.env.CLIENT_SECRET,
                grant_type: "authorization_code",
                redirect_uri: "http://127.0.0.1:5173/login"
            }
            const reqToken = await axios.post('https://api.intra.42.fr/oauth/token', data)
            if (reqToken.status !== 200)
                return;
            if (reqToken?.data?.access_token === undefined) {
                console.error('Error jamais sense arrive access_token')
                return;
            }
            console.log('hello world');
            const info = await axios.get('https://api.intra.42.fr/v2/me', {headers: {Authorization: `Bearer ${reqToken.data.access_token}`}})
            if (info.status !== 200)
                return;
            if (info?.data?.login === undefined) {
                console.error('Error jamais sense arrive login')
                return;
            }
            const login = info.data.login;

            let user: User;
            try {
                user = await this.userService.getUserByLogin(login);
            } catch (exception) {
                user = await this.userService.saveNewUser(login);
            }

            console.log('success');
            return await this.authService.intra(user);
        } catch (exception) {
            console.error(exception.message);
        }
    }

}

