import {Controller, Get, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors} from "@nestjs/common";
import {UserService} from "../service/user.service";
import { createWriteStream } from 'fs';
import {FileInterceptor} from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";


@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UserService,
    ) {}

    @Get()
    async getUsers() : Promise<any> {
        return this.usersService.getUsers();
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('photo', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = uuidv4();
                const extension = path.extname(file.originalname);
                const filename = file.fieldname + '-' + uniqueSuffix + extension;
                cb(null, filename);
            }
        })
    }))
    async uploadFile(@UploadedFile() file) {
        console.log(file);
    }

}