import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app/app.module";
import {UsersService} from "./users/service/users.service";
import {ChannelsService} from "./channels/service/channels.service";
import {ChannelType} from "./channels/enum/channel-type.enum";
import {ValidationPipe} from "@nestjs/common";
import {PunishmentType} from "./channels/enum/punishment-type.enum";

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
//     const users = [];
//     for (let i = 0; i < amount; i++) {
//         const user = usersService.createUser(makeid(8), makeid(8) + "@gmail.com");
//         users.push(user);
//     }
//     return users;
// }
//
// async function test(app: any) {
//     const usersService = app.get(UsersService);
//     const channelsService = app.get(ChannelsService);
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
let channel;

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
    await app.listen(8000);

    let channel;
    let user;
    let user2;

    const usersService = app.get(UsersService);
    const channelsService = app.get(ChannelsService);

    try {
        user = await usersService.getUserById(1);
    } catch (error) {
        user = await usersService.saveNewUser(usersService.createUser(makeid(8), makeid(8) + "@gmail.com"));
    }

    try {
        user2 = await usersService.getUserById(2);
    } catch (error) {
        user2 = await usersService.saveNewUser(usersService.createUser(makeid(8), makeid(8) + "@gmail.com"));
    }

    try {
        channel = await channelsService.getChannelById(1);
    } catch (ex) {
        channel = await channelsService.createChannel(user, ChannelType.PUBLIC);
    }

    //join channel
    try {
        await channelsService.joinChannel(channel, user2);
    } catch (e) {
        console.log("Error: ", e);
    }

    try {
        await channelsService.setChannelPassword(channel, user, "1234Y34GFYSDGF8T7");
    } catch (e) {
        console.log("Error: ", e);
    }

    try {
        await channelsService.sendMessage(channel, user, "Hello world!");
    } catch (e) {
        console.log("Error: ", e);
    }

    try {
        //create an end date 4m from now:
        const endDate = new Date();
        endDate.setMinutes(endDate.getMinutes() + 4);

        await channelsService.applyPunishment(channel, user, user2, PunishmentType.MUTE, endDate);
    } catch (e) {
        console.log("Error: ", e);
    }

    try {
        await channelsService.sendMessage(channel, user2, "Hello world!");
    } catch (e) {
        console.log("Error: ", e);
    }

    console.log("Channel: ", channel);
}

bootstrap().then(r => console.log("App started!")).catch(e => console.log("Error: ", e));






















