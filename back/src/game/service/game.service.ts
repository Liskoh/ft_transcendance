import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MatchHistory} from "../entity/match-history.entity";
import {Repository} from "typeorm";

@Injectable()
export class GameService {

        constructor(@InjectRepository(MatchHistory) private readonly gameRepository: Repository<MatchHistory>) {
        }

}