import {Controller, Get, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors} from "@nestjs/common";
import {UserService} from "../service/user.service";
import { createWriteStream } from 'fs';
import {FileInterceptor} from "@nestjs/platform-express";
import { diskStorage } from 'multer';


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