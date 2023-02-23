import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GameService} from "./service/game.service";
import {MatchHistory} from "./entity/match-history.entity";

@Module({
    exports: [GameService],
    imports: [TypeOrmModule.forFeature([MatchHistory])],
    controllers: [],
    providers: [GameService]
})
export class GameModule {}
