import {Controller, Get} from "@nestjs/common";
import {ChannelService} from "../../channel/service/channel.service";
import {UserService} from "../../user/service/user.service";
import {GameService} from "../service/game.service";

@Controller('game')
export class GameController {


    constructor(
        private readonly gameService: GameService,
    ) {
    }

    @Get('history')
    getHistory() {
        return this.gameService.getData();
    }

}