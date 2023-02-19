"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app/app.module");
const users_service_1 = require("./users/service/users.service");
const channels_service_1 = require("./channel/service/channels.service");
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        yield app.listen(8000);
        // AppDataSource.initialize().then(async () => {
        // }).catch(e => console.log("Error: ", e));
        const usersService = app.get(users_service_1.UsersService);
        const channelsService = app.get(channels_service_1.ChannelsService);
        //
        let user = yield usersService.createUser(makeid(8));
        let channel = yield channelsService.createChannel(user);
        // console.log("User created: ", user);
        console.log(channel);
    });
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
//# sourceMappingURL=index.js.map