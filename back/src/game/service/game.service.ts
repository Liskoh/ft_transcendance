import {HttpException, HttpStatus, Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MatchHistory} from "../entity/match-history.entity";
import {Repository} from "typeorm";
import {User} from "../../user/entity/user.entity";
import {UserService} from "../../user/service/user.service";
import {Game} from "../model/game.model";
import {Socket} from "socket.io";
import {Duel} from "../interface/duel.interface";

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
    private activeGames: Game[] = [];
    private queueIds: string[] = [];
    private duels: Duel[] = [];

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

    getQueue(): string[] {
        return this.queueIds;
    }

    isOnQueue(socket: Socket): boolean {
        return this.queueIds.includes(socket.id);
    }

    getCurrentGame(socket: Socket): Game {
        for (const game of this.activeGames) {
            if (game.firstPlayer && game.firstPlayer.id === socket.id) {
                return game;
            }

            if (game.secondPlayer && game.secondPlayer.id === socket.id) {
                return game;
            }
        }
        return null;
    }

    canJoinGame(socket: Socket, game: Game): boolean {

        if (this.getCurrentGame(socket)) {
            return false;
        }

        if (game.isPrivate && !game.invitations.includes(socket.id)) {
            return false;
        }

        game.invitations = [];
        return true;
    }

    joinQueue(socket: Socket): void {
        if (this.isOnQueue(socket)) {
            throw new HttpException(
                'user already in queue',
                HttpStatus.BAD_REQUEST
            );
        }

        this.queueIds.push(socket.id);
    }

    clearQueue(): void {
        this.queueIds = [];
    }

    getActiveMatches(): MatchHistory[] {
        return this.activeMatches;
    }

}