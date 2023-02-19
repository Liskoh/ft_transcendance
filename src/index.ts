import {Post} from "./entity/Post"
import {Category} from "./entity/Category"
import {AppDataSource} from "./data-source"
import {User} from "./users/entity/user.entity";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app/app.module";
import {UsersService} from "./users/service/users.service";
import {Channel} from "./channel/entity/channel.entity";
import {ChannelsService} from "./channel/service/channels.service";

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function main() {
    const app = await NestFactory.create(AppModule);
    await app.listen(8000);


    // AppDataSource.initialize().then(async () => {
    // }).catch(e => console.log("Error: ", e));

    const usersService = app.get(UsersService);
    const channelsService = app.get(ChannelsService);

    //
    let user = await usersService.createUser(makeid(8));

    let channel = await channelsService.createChannel(user);

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
