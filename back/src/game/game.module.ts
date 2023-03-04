import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GameService} from "./service/game.service";
import {MatchHistory} from "./entity/match-history.entity";
import {UserService} from "../user/service/user.service";
import {UserModule} from "../user/user.module";
import {GameGateway} from "./gateway/game.gateway";
import {AuthModule} from "../auth/auth.module";

@Module({
    exports: [GameService],
    imports: [
        UserModule,
        AuthModule,
        TypeOrmModule.forFeature([
                MatchHistory
            ]
        ),
        ],
    controllers: [],
    providers: [GameService, GameGateway]
})
export class GameModule {
}
