import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GameService} from "./service/game.service";
import {MatchHistory} from "./entity/match-history.entity";
import {UserService} from "../user/service/user.service";
import {UserModule} from "../user/user.module";

@Module({
    exports: [GameService],
    imports: [
        UserModule,
        TypeOrmModule.forFeature([
                MatchHistory
            ]
        ),
        ],
    controllers: [],
    providers: [GameService]
})
export class GameModule {
}
