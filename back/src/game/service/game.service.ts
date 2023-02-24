import {HttpException, HttpStatus, Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MatchHistory} from "../entity/match-history.entity";
import {Repository} from "typeorm";
import {User} from "../../user/entity/user.entity";
import {UserService} from "../../user/service/user.service";
// import { CronJob } from 'cron';

@Injectable()
export class GameService {

    constructor(
        @InjectRepository(MatchHistory)
        private readonly gameRepository: Repository<MatchHistory>,
        @Inject(UserService)
        private readonly userService: UserService
    ) {
    }

    //List of acvtives games
    private activeMatches: MatchHistory[] = [];
    // private job: CronJob;
    /**
     * return all match history
     * @returns {Promise<MatchHistory[]>}
     */
    async getData(): Promise<MatchHistory[]> {
        return await this.gameRepository.find();
    }

    /**
     * update and save match history
     * @param {MatchHistory} cacheHistory
     * @returns {Promise<MatchHistory>}
     */
    async createMatchHistory(cacheHistory: MatchHistory): Promise<MatchHistory> {
        const matchHistory = new MatchHistory();

        let firstPlayer;
        let secondPlayer;

        try {
            firstPlayer = await this.userService.getUserById(cacheHistory.firstPlayerId);
            secondPlayer = await this.userService.getUserById(cacheHistory.secondPlayerId);
        } catch (e) {
            throw new HttpException(
                'one of the players does not exist',
                HttpStatus.NOT_FOUND
            );
        }

        //set the winner of the match (in case of equality, the winner is the first player)
        if (cacheHistory.firstPlayerScore > cacheHistory.secondPlayerScore) {
            matchHistory.winner = firstPlayer;
            matchHistory.loser = secondPlayer;
        } else if (cacheHistory.firstPlayerScore < cacheHistory.secondPlayerScore) {
            matchHistory.winner = secondPlayer;
            matchHistory.loser = firstPlayer;
        } else {
            matchHistory.winner = firstPlayer;
            matchHistory.loser = secondPlayer;
        }

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

    createMatch(user: User): MatchHistory {
        if (this.isUserInActiveMatch(user)) {
            throw new HttpException(
                'user already in a match',
                HttpStatus.BAD_REQUEST
            );
        }

        const match = new MatchHistory();
        match.firstPlayerId = user.id;
        this.activeMatches.push(match);

        return match;
    }

    startMatch(match: MatchHistory): MatchHistory {
        if (match.started) {
            throw new HttpException(
                'match already started',
                HttpStatus.BAD_REQUEST
            );
        }

        if (match.firstPlayerId && match.secondPlayerId) {
            match.started = true;
            return match;
        }

        throw new HttpException(
            'match not ready to start',
            HttpStatus.BAD_REQUEST
        );
    }

    findMatch(user: User): MatchHistory {
        if (this.isUserInActiveMatch(user)) {
            throw new HttpException(
                'user already in a match',
                HttpStatus.BAD_REQUEST
            );
        }

        for (const match of this.activeMatches) {
            if (!match.secondPlayerId && !match.started) {
                match.secondPlayerId = user.id;
                return match;
            }
        }
    }

    /**
     * return if a user is in an active match or not
     * @param {User} user
     */
    isUserInActiveMatch(user: User): boolean {
        for (const match of this.activeMatches) {
            if (match.firstPlayerId === user.id || match.secondPlayerId === user.id) {
                return true;
            }
        }

        return false;
    }

}