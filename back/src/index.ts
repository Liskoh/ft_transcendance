import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app/app.module";
import {UsersService} from "./users/service/users.service";
import {ChannelsService} from "./channels/service/channels.service";
import {ChannelType} from "./channels/enum/channel-type.enum";
import {User} from "./users/entity/user.entity";
import {GameService} from "./game/service/game.service";
import {MatchHistory} from "./game/entity/match-history.entity";

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function addMembers(amount: number, usersService: any) : User[] {
    const users = [];
    for (let i = 0; i < amount; i++) {
        const user = usersService.createUser(makeid(8), makeid(8) + "@gmail.com");
        users.push(user);
    }
    return users;
}

async function test(app: any) {
    const usersService = app.get(UsersService);
    const channelsService = app.get(ChannelsService);

    let user = await usersService.getUserById(1);
    if (!user) {
        user = await usersService.saveNewUser(usersService.createUser(makeid(8), makeid(8) + "@gmail.com"));
    }

    // console.log("User created: ", user);

    let channel = await channelsService.getChannelById(1);

    if (!channel) {
        channel = await channelsService.createChannel(user, ChannelType.PUBLIC);
    }


    let lastUser: User = null;

    for (const us of addMembers(1, usersService)) {
        lastUser = us;
        await usersService.saveNewUser(us);
        await channelsService.joinChannel(channel, us);
        await channelsService.sendMessage(channel, us, "Hello world!");
    }

    await channelsService.muteUser(channel, user, lastUser);
    await channelsService.banUser(channel, user, lastUser, new Date(2026, 1, 1));

    console.log(channel);

    const gameService = app.get(GameService);

    // const matchHistory = await gameService.createMatchHistory(10, 5, user, lastUser);

    // console.log("Match history: ", matchHistory);
}

async function main() {
    const app = await NestFactory.create(AppModule);
    // await app.listen(8000);

    if (true) {
        await test(app);
        return;
    }


    // AppDataSource.initialize().then(async () => {
    // }).catch(e => console.log("Error: ", e));

    const usersService = app.get(UsersService);
    const channelsService = app.get(ChannelsService);

    //
    let user = await usersService.saveNewUser(usersService.createUser(makeid(8), makeid(8) + "@gmail.com"));

    console.log("User created: ", user);


    user = await usersService.changeLogin(user, makeid(8));

    console.log("User changed: ", user);

    let channel = await channelsService.createChannel(user, ChannelType.PUBLIC);

    // console.log("User created: ", user);
    console.log(channel);
}

//START APP:
main().then(r => console.log("App started!")).catch(e => console.log("Error: ", e));

// AppDataSource.initialize()
//     .then(async () => {
//         const category1 = new Category()
//         category1.name = "TypeScript"
//         await AppDataSource.manager.save(category1)
//
//         const category2 = new Category()
//         category2.name = "Programming"
//         await AppDataSource.manager.save(category2)
//
//         const post = new Post()
//         post.title = "TypeScript"
//         post.text = `TypeScript is Awesome!`
//         post.categories = [category1, category2]
//
//         await AppDataSource.manager.save(post)
//
//         console.log("Post has been saved: ", post)
//
//
//         const post1 = await AppDataSource.manager.find(Post);
//
//         if (post1) {
//             console.log(post.categories);
//         }
//
//         let user = new User(makeid(8));
//
//         await AppDataSource.manager.save(user);
//
//
//     })
//     .catch((error) => console.log("Error: ", error))
