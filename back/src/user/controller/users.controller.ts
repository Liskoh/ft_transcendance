import {
    Controller, Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import { Response } from 'express';
import {UserService} from "../service/user.service";
import * as fs from 'fs';
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from 'multer';
import * as path from "path";
import {User} from "../entity/user.entity";

const allowedExtensions = ['.jpg', '.jpeg', '.png'];

@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UserService,
    ) {
    }

    static async findUserFileWithoutExtension(destination: string, login: string): Promise<string | null> {
        const files = await fs.promises.readdir(destination);
        const matchingFile = files.find((file) => {
            const fileWithoutExtension = file.split('.')[0];
            const dotIndex = fileWithoutExtension.indexOf('.');
            return fileWithoutExtension.startsWith(login) && dotIndex > login.length;
        });
        if (matchingFile) {
            const extension = path.extname(matchingFile);
            return matchingFile.slice(0, -extension.length);
        } else {
            return null;
        }
    }

    @Get('avatar/:login')
    async getAvatar(@Param('login') login: string, @Res() res: Response): Promise<void> {
        console.log('called');
        try {
            console.log('called2');
            const user: User = await this.usersService.getUserByLogin(login);
            const filename = user.avatar;
            if (!fs.existsSync('./uploads/'))
                fs.mkdirSync('./uploads/');

            if (filename && filename.length > user.login.length) {
                console.log('called3');
                const imagePath = path.join('./uploads', filename);
                res.sendFile(imagePath, {root: '.'});
            } else {
                console.log('called4');
                res.status(HttpStatus.NOT_FOUND).send(`Avatar for user ${login} not found`);
            }
        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(`Error while getting avatar for user ${login}`);
        }
    }


    @Post('upload')
    @UseInterceptors(FileInterceptor('photo', {
        limits: {
            fileSize: 1024 * 1024
        },
        storage: diskStorage({
            destination: './uploads',
            filename: async (req, file, cb) => {
                const extension = path.extname(file.originalname);
                if (!allowedExtensions.includes(extension)) {
                    return cb(new HttpException('Extension not allowed', HttpStatus.BAD_REQUEST), null);
                }
                console.log(1);
                const user = req.user;
                if (!user) {
                    return cb(new HttpException('User not found', HttpStatus.BAD_REQUEST), null);
                }
                console.log(2);
                const login = user.login;
                const find = await UsersController.findUserFileWithoutExtension('./uploads', login);
                if (find) {
                    try {
                        if (fs.existsSync(find))
                            await fs.promises.unlink(find);
                    } catch (error) {
                        return cb(new HttpException('Error while deleting old file', HttpStatus.BAD_REQUEST), null);
                    }
                }
                console.log(3);
                const filename = login + extension;
                cb(null, filename);
            }
        })
    }))
    async uploadFile(@UploadedFile() file, @Req() req): Promise<any> {
        const user: User = req.user;

        user.avatar = file.filename;
        await this.usersService.saveUser(user);
        console.log(user.avatar);
        // return {
        //     HTTPStatus: HttpStatus.OK,
        //     message: 'File uploaded successfully ( ' + file.filename + ' )'
        // }
    }

}