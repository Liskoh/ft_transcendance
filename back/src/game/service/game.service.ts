import {HttpException, HttpStatus, Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MatchHistory} from "../entity/match-history.entity";
import {Repository} from "typeorm";
import {User} from "../../user/entity/user.entity";
import {UserService} from "../../user/service/user.service";
import {Game} from "../model/game.model";
import {Socket} from "socket.io";
import {Duel} from "../interface/duel.interface";
import {Player} from "../model/player.model";
import {LoginNicknameDto} from "../../user/dto/login-nickname.dto";
import {validateOrReject} from "class-validator";
import {getUserBySocket, sendErrorToClient} from "../../utils";
import {UserStatus} from "../../user/enum/user-status.enum";
import {GameLevel} from "../enum/game-level.enum";
import {CreateDuelDto} from "../dto/create-duel.dto";

// import { CronJob } from 'cron';

@Injectable()
export class GameService {

    constructor(
        @InjectRepository(MatchHistory)
        private readonly gameRepository: Repository<MatchHistory>,
        @Inject(UserService)
        private readonly userService: UserService
    ) {
        this.handleTask();
    }

    public usersMap: Map<Socket, string> = new Map<Socket, string>();

    //List of acvtives games
    private activeGames: Game[] = [];
    private queueIds: Socket[] = [];
    private duels: Duel[] = [];

    /**
     * return all match history
     * @returns {Promise<MatchHistory[]>}
     */
    async getData(): Promise<MatchHistory[]> {
        return await this.gameRepository.find();
    }

    async saveMatchHistory(matchHistory: MatchHistory): Promise<MatchHistory> {
        try {
            return await this.gameRepository.save(matchHistory);
        } catch (e) {}
    }

    //create a repeating task whithtout cron:
    handleTask() {
        setInterval(async () => {
            await this.checkMatches();
        }, 500);
    }

    async checkMatches() {
        for (const game of this.activeGames) {
            if (game.firstPlayer.score >= 5 || game.secondPlayer.score >= 5) {
                await this.endGame(game);
            }
        }
    }

    async endGame(game: Game) {
        try {
            const firstPlayer = await this.userService.getUserById(game.firstPlayer.userId);
            const secondPlayer = await this.userService.getUserById(game.secondPlayer.userId);

            game.emitToEveryone('endGame');

            if (firstPlayer.status === UserStatus.IN_GAME)
                firstPlayer.status = UserStatus.ONLINE;

            if (secondPlayer.status === UserStatus.IN_GAME)
                secondPlayer.status = UserStatus.ONLINE;

            this.activeGames = this.activeGames.filter(g => g.uuid !== game.uuid);
            await this.createMatchHistory(firstPlayer.id, secondPlayer.id, game.firstPlayer.score, game.secondPlayer.score);
            //TODO SEND SOCKET TO CLIENTS
        } catch (silent) {
        }
    }

    async createMatchHistory(firstUserId: number, secondUserId: number, firstScore: number, secondScore: number): Promise<MatchHistory> {
        const matchHistory = new MatchHistory();

        let firstPlayer = null
        let secondPlayer = null;

        try {
            firstPlayer = await this.userService.getUserById(firstUserId);
            secondPlayer = await this.userService.getUserById(secondUserId);
        } catch (e) {
            return null;
        }

        matchHistory.firstUser = firstPlayer;
        matchHistory.secondUser = secondPlayer;
        matchHistory.firstPlayerScore = firstScore;
        matchHistory.secondPlayerScore = secondScore;

        //set the winner of the match (in case of equality, the winner is the first player)
        if (firstScore > secondScore) {
            matchHistory.winner = firstPlayer;
            matchHistory.loser = secondPlayer;
        } else if (firstScore < secondScore) {
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

    getMatchHistory(user: User, data: MatchHistory[]): MatchHistory[] {
        let history: MatchHistory[] = [];

        for (const match of data) {
            if (match.loser.id === user.id || match.winner.id === user.id) {
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


    /********************************************/
    /*                                          */
    /*                  DUELS                   */
    /*                                          */

    /********************************************/

    getWaitingDuelsForUser(user: User): Duel[] {
        return this.duels.filter(duel => duel.secondUserId === user.id);
    }

    /**
     * accept a duel
     * @param {User} user
     * @param {User} target
     * @returns {Duel}
     */
    acceptDuel(user: User, target: User): Duel {
        this.removeExpiredDuels();

        for (const duel of this.duels) {
            if (duel.firstUserId === target.id) {
                this.duels.splice(this.duels.indexOf(duel), 1);
                return duel;
            }
        }

        throw new HttpException(
            'Duel not found or expired',
            HttpStatus.NOT_FOUND
        );
    }

    removeDuel(duel: Duel) {
        this.duels.splice(this.duels.indexOf(duel), 1);
    }

    /**
     * return if a duel exist or not
     * @param {User} user
     * @param {User} target
     */
    isDuelExist(user: User, target: User): boolean {
        for (const duel of this.duels) {
            if (duel.firstUserId === user.id && duel.secondUserId === target.id) {
                return true;
            }
        }
        return false;
    }

    async onCreateDuel(client: Socket, usersMap: Map<Socket, string>, payload: any): Promise<any> {
        try {
            const dto: CreateDuelDto = new CreateDuelDto(payload);
            await validateOrReject(dto);

            const user: User = await getUserBySocket(client, this.userService, usersMap);
            const targetUser: User = await this.userService.getUserByNickname(dto.login);
            const gameLevel: GameLevel = dto.gameLevel;

            const duel: Duel = this.createDuel(user, targetUser, gameLevel);
        } catch (error) {
            console.log(error);
            await sendErrorToClient(client, 'duelError', error.message);
        }
        // await GameGateway.createDuel(client, this.usersService, this.gameService, payload);
    }

    /**
     * create a duel
     * @param {User} user
     * @param {User} target
     * @returns {Duel}
     */
    createDuel(user: User, target: User, level: GameLevel): Duel {
        this.removeExpiredDuels();
        console.log(this.duels);

        if (user.id === target.id)
            throw new HttpException(
                'You can\'t duel yourself',
                HttpStatus.BAD_REQUEST
            );

        if (this.isDuelExist(user, target)) {
            throw new HttpException(
                'Duel already exist',
                HttpStatus.BAD_REQUEST
            );
        }

        const duel: Duel = {
            firstUserId: user.id,
            secondUserId: target.id,
            firstUserNickname: user.nickname,
            secondUserNickname: target.nickname,
            gameLevel: level,
            expirationDate: new Date(new Date().getTime() + 30 * 1000), //30 seconds
            accepted: false
        };

        this.duels.push(duel);
        return duel;
    }

    /**
     * remove expired duels
     * @returns {void}
     */
    removeExpiredDuels(): void {
        const now = new Date();
        this.duels = this.duels.filter(duel => duel.expirationDate > now);
    }

    getCurrentGame(socket: Socket): Game {
        for (const game of this.activeGames) {
            if (game.firstPlayer && game.firstPlayer.client === socket) {
                return game;
            }

            if (game.secondPlayer && game.secondPlayer.client === socket) {
                return game;
            }

            for (const spectator of game.spectators) {
                if (spectator === socket) {
                    return game;
                }
            }
        }
        return null;
    }

    getCurrentGameByUserId(userId: number): Game {
        for (const game of this.activeGames) {
            if (game.firstPlayer && game.firstPlayer.userId === userId) {
                return game;
            }

            if (game.secondPlayer && game.secondPlayer.userId === userId) {
                return game;
            }
        }
        return null;
    }

    getPlayerByUserId(userId: number): Player {
        for (const game of this.activeGames) {
            console.log(game.firstPlayer.userId + ' ' + userId);
            console.log(game.secondPlayer.userId + ' ' + userId);
            if (game.firstPlayer && game.firstPlayer.userId === userId) {
                return game.firstPlayer;
            }

            if (game.secondPlayer && game.secondPlayer.userId === userId) {
                return game.secondPlayer;
            }
        }
        return null;
    }

    async startGame(game: Game): Promise<void> {
        this.activeGames.push(game);
        game.startGame();

        try {
            const firstUser: User = await this.userService.getUserById(game.firstPlayer.userId);
            const secondUser: User = await this.userService.getUserById(game.secondPlayer.userId);

            firstUser.status = UserStatus.IN_GAME;
            secondUser.status = UserStatus.IN_GAME;
        } catch (error) {
        }
    }

    canJoinGame(socket: Socket): boolean {

        if (this.getCurrentGame(socket)) {
            return false;
        }

        return true;
    }

    removeSpectator(socket: Socket) {
        for (const game of this.activeGames) {
            if (game.spectators.includes(socket)) {
                game.spectators.splice(game.spectators.indexOf(socket), 1);
            }
        }
    }

    getGameByUuid(uuid: string): Game {
        for (const game of this.activeGames) {
            if (game.uuid === uuid) {
                return game;
            }
        }

        throw new HttpException(
            'Game not found',
            HttpStatus.NOT_FOUND
        );
    }

    getGames(): Game[] {
        return this.activeGames;
    }

    isSpectator(socket: Socket): boolean {
        for (const game of this.activeGames) {
            if (game.spectators.includes(socket)) {
                return true;
            }
        }
        return false;
    }

    spectate(socket: Socket, game: Game) {
        if (this.isSpectator(socket))
            this.removeSpectator(socket);

        if (this.getCurrentGame(socket))
            throw new HttpException(
                'You are already in a game',
                HttpStatus.BAD_REQUEST
            );

        game.spectators.push(socket);
        socket.emit('sendOnPong');
    }

    /********************************************/
    /*                                          */
    /*                  QUEUE                   */
    /*                                          */

    /********************************************/
    getQueue(): Socket[] {
        return this.queueIds;
    }

    isOnQueue(socket: Socket): boolean {
        return this.queueIds.includes(socket);
    }

    joinQueue(socket: Socket): void {
        if (this.isOnQueue(socket)) {
            throw new HttpException(
                'user already in queue',
                HttpStatus.BAD_REQUEST
            );
        }

        this.queueIds.push(socket);
    }

    leaveQueue(socket: Socket): boolean {
        if (!this.isOnQueue(socket)) {
            // throw new HttpException(
            //     'user not in queue',
            //     HttpStatus.BAD_REQUEST
            // );
            return false;
        }

        this.queueIds = this.queueIds.filter(s => s.id !== socket.id);
        return true;
    }

    clearQueue(): void {
        this.queueIds = [];
    }
}