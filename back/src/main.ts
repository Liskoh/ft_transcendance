import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app/app.module";
import {UserService} from "./user/service/user.service";
import {ChannelService} from "./channel/service/channel.service";
import {ChannelType} from "./channel/enum/channel-type.enum";
import {ValidationPipe} from "@nestjs/common";
import {PunishmentType} from "./channel/enum/punishment-type.enum";
import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// function addMembers(amount: number, usersService: any): User[] {
//     const user = [];
//     for (let i = 0; i < amount; i++) {
//         const user = usersService.createUser(makeid(8), makeid(8) + "@gmail.com");
//         user.push(user);
//     }
//     return user;
// }
//
// async function test(app: any) {
//     const usersService = app.get(UserService);
//     const channelsService = app.get(ChannelService);
//
//     // let user = await usersService.saveNewUser(usersService.createUser(makeid(8), makeid(8) + "@gmail.com"));
//     let user;
//     //YARN START DEV ?
//     try {
//
//         user = usersService.createUser(makeid(8), "john");
//         const dto = new RegisterUserDto(user.login, user.email);
//         user = await usersService.saveNewUser(dto);
//      } catch (error) {
//         console.log("Error: ", error);
//     }
//
//
//     console.log("User created: ", user);

// try {
//     user = await usersService.getUserById(1);
// } catch (error) {
//     user = await usersService.saveNewUser(usersService.createUser(makeid(8), makeid(8) + "@gmail.com"));
// }

// console.log("User created: ", user);
// let channel;

// try {
//     channel = await channelsService.getChannelById(1);
// } catch (ex) {
//     channel = await channelsService.createChannel(user, ChannelType.PUBLIC);
// }
//
// let lastUser: User = null;
//
// for (const us of addMembers(1, usersService)) {
//     lastUser = us;
//     await usersService.saveNewUser(us);
//     await channelsService.joinChannel(channel, us);
//     await channelsService.sendMessage(channel, us, "Hello world!");
// }
//
//
// console.log(channel);
//
// const gameService = app.get(GameService);

// const matchHistory = await gameService.createMatchHistory(10, 5, user, lastUser);

// console.log("Match history: ", matchHistory);
// }

// async function main() {
//     const app = await NestFactory.create(AppModule);
//     // await app.listen(8000);
//
//     if (true) {
//         await test(app);
//         return;
//     }
// }

//START APP:
// main().then(r => console.log("App started!")).catch(e => console.log("Error: ", e));


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

   const cors: CorsOptions = {
        origin: [
            'http://localhost:5173'
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        optionsSuccessStatus: 200,
    };

    app.enableCors(cors);

    await app.listen(8000);

    // await app.listen(3000);

    let channel;
    let user;
    let user2;

    const usersService = app.get(UserService);
    const channelsService = app.get(ChannelService);
    const list: string[] = [];

    // try {
    //     user = await usersService.getUserById(-1);
    // } catch (error) {
    //     user = await usersService.saveNewUser(usersService.createUser(makeid(8)));
    // }
    //
    // try {
    //     user2 = await usersService.getUserById(-1);
    // } catch (error) {
    //     user2 = await usersService.saveNewUser(usersService.createUser(makeid(8)));
    // }
    //
    // try {
    //     channel = await channelsService.getChannelById(1);
    // } catch (ex) {
    //     channel = await channelsService.createChannel(user, ChannelType.PUBLIC);
    // }
    //
    // //join channel
    // try {
    //     await channelsService.joinChannel(channel, user2);
    // } catch (e) {
    //     list.push(e.status + " " + e.message);
    // }
    //
    // //set password
    // try {
    //     await channelsService.setChannelPassword(channel, user, "1234Y34GFYSDGF8T7");
    //     // await channelsService.setChannelPassword(channel, user, null);
    // } catch (e) {
    //     list.push(e.status + " " + e.message);
    // }
    //
    // try {
    //     await channelsService.sendMessage(channel, user, "Hello world!");
    //     await channelsService.sendMessage(channel, user, "Hello world!");
    // } catch (e) {
    //     list.push(e.status + " " + e.message);
    // }
    //
    // try {
    //     const endDate = new Date();
    //     endDate.setMinutes(endDate.getMinutes() + 4);
    //
    //     await channelsService.applyPunishment(channel, user, user2, PunishmentType.MUTE, endDate);
    //     await channelsService.applyPunishment(channel, user, user2, PunishmentType.MUTE, endDate);
    // } catch (e) {
    //     list.push(e.status + " " + e.message);
    // }
    //
    // try {
    //     await channelsService.sendMessage(channel, user2, "Hello world!");
    //     await channelsService.sendMessage(channel, user2, "Hello world!");
    // } catch (e) {
    //     list.push(e.status + " " + e.message);
    // }

    // console.log("Channel: ", channel);
    for (const s of list) {
        console.log("\x1b[31m%s\x1b[0m", "Error: " + s);
    }
}

bootstrap().then(r => console.log("App started!")).catch(e => console.log("Error: ", e));






















