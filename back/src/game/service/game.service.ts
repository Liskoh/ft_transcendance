import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MatchHistory} from "../entity/match-history.entity";
import {Repository} from "typeorm";
import {User} from "../../users/entity/user.entity";

@Injectable()
export class GameService {

    constructor(@InjectRepository(MatchHistory) private readonly gameRepository: Repository<MatchHistory>) {
    }

    /**
     * return all match history
     * @returns {Promise<MatchHistory[]>}
     */
    async getData(): Promise<MatchHistory[]> {
        return await this.gameRepository.find();
    }

    /**
     * create and return a match history
     * @param {number} firstPlayerScore
     * @param {number} secondPlayerScore
     * @param {User} winner
     * @param {User} loser
     */
    async createMatchHistory(firstPlayerScore: number, secondPlayerScore: number, winner: User, loser: User): Promise<MatchHistory> {
        const matchHistory = new MatchHistory();

        matchHistory.firstPlayerScore = firstPlayerScore;
        matchHistory.secondPlayerScore = secondPlayerScore;
        matchHistory.winner = winner;
        matchHistory.loser = loser;

        return await this.gameRepository.save(matchHistory);
    }

    /*
     * NON ASYNC
     */

    /**
     * return wins for a user
     * @param {User} user
     * @param {MatchHistory[]} data
     * @returns {MatchHistory[]}
     */
    getWinsHistory(user: User, data: MatchHistory[]): MatchHistory[] {
        const history = [];

        for (const match of data) {
            if (match.winner.id === user.id) {
                history.push(match);
            }
        }

        return history;
    }

    /**
     * return loses for a user
     * @param {User} user
     * @param {MatchHistory[]} data
     * @returns {MatchHistory[]}
     */
    getLosesHistory(user: User, data: MatchHistory[]): MatchHistory[] {
        const history = [];

        for (const match of data) {
            if (match.loser.id === user.id) {
                history.push(match);
            }
        }

        return history;
    }

}