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

    @Post('/upload')
    // @UseInterceptors(FileInterceptor('profileImage'))
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${file.originalname}`);
                }
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
            fileFilter: (req,
                         file,
                         cb) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg']
                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true)
                } else {
                    cb(new Error('Invalid file type'), false);
                }
            },
        }),
    )
    async upload(@UploadedFile() file) : Promise<any> {
        // const dimensions = sizeOf(file.path);
        // console.log(dimensions.width, dimensions.height);
        // if (dimensions.width !== dimensions.height) {
        //     throw new HttpException(
        //         'Image must be square',
        //         HttpStatus.BAD_REQUEST
        //     );
        // }

        console.log(file);
        return {
            url: `http://localhost:3000/${file.path}`,
            status: HttpStatus.OK,
            message: 'Image uploaded successfully',
        }
        // const user = await this.usersService.getUserById(1);
        // user.profileImage = file.path;
        // await this.usersService.saveUser(use/r);
        // return user;
    }

}