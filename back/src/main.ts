import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app/app.module";
import {UserService} from "./user/service/user.service";
import {ChannelService} from "./channel/service/channel.service";
import {ChannelType} from "./channel/enum/channel-type.enum";
import {ValidationPipe} from "@nestjs/common";
import {PunishmentType} from "./channel/enum/punishment-type.enum";
import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

   const cors: CorsOptions = {
        origin: [
            'http://' + process.env.WEB_HOST +':5173',
            'http://' + process.env.WEB_HOST + ':8000'
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        optionsSuccessStatus: 200,
    };

    app.enableCors(cors);

    await app.listen(process.env.BACK_PORT);
}

bootstrap().then(r => console.log("App started!")).catch(e => console.log("Error: ", e));






















