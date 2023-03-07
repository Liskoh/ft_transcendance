import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {validateOrReject} from "class-validator";
import {GameService} from "../service/game.service";
import {Game} from "../model/game.model";
import {AuthService} from "../../auth/auth.service";
import {UserService} from "../../user/service/user.service";
import {Player} from "../model/player.model";
import {Ball} from "../model/ball.model";
import {GameState} from "../enum/game-state.enum";
import {
    getSocketsByUser,
    getUserBySocket,
    sendErrorToClient,
    tryHandleConnection,
    tryHandleDisconnect
} from "../../utils";
import {LoginNicknameDto} from "../../user/dto/login-nickname.dto";
import {User} from "../../user/entity/user.entity";
import {Duel} from "../interface/duel.interface";
import {IdDto} from "../../channel/dto/id.dto";
import {UuidDto} from "../dto/uuid.dto";
import {ContextCreator} from "@nestjs/core/helpers/context-creator";

const usersMap: Map<Socket, string> = new Map();

@WebSocketGateway(
    {
        cors: {
            origin: '*'
        },
        namespace: 'game'
    }
)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly gameService: GameService,
        private readonly authService: AuthService,
        private readonly usersService: UserService,
    ) {
    }

    @WebSocketServer()
    server: Server;

    public static getUsersMap(): Map<Socket, string> {
        return usersMap;
    }

    async handleConnection(socket: Socket, ...args: any[]): Promise<any> {
        const ret: boolean = await tryHandleConnection(socket, usersMap, this.usersService, this.authService, 'game', ...args);
        if (ret) {
            try {
                const user: User = await getUserBySocket(socket, this.usersService, usersMap);
                const player: Player = await this.gameService.getPlayerByUserId(user.id);
                if (player) {
                    player.userId = user.id;
                    player.client = socket;
                }

            } catch (error) {
                console.log(55);
            }
        }
    }


    async handleDisconnect(socket: Socket): Promise<any> {
        await tryHandleDisconnect(socket, usersMap, 'game');
        try {
            this.gameService.removeSpectator(socket);

            if (this.gameService.leaveQueue(socket))
                console.log(socket.id + " ===>  leaved the queue");
        } catch (error) {
            console.log('handleDisconnect error: ' + error);
        }
    }

    @SubscribeMessage('spectate')
    async handleSpectate(socket: Socket, data: any): Promise<any> {
        try {
            const user: User = await getUserBySocket(socket, this.usersService, usersMap);
            const dto: UuidDto = new UuidDto(data);
            await validateOrReject(dto);

            const game: Game = await this.gameService.getGameByUuid(dto.uuid);

            this.gameService.spectate(socket, game);
        } catch (error) {
            console.log(error);
            await sendErrorToClient(socket, 'gameError', error);
        }
    }

    @SubscribeMessage('getGames')
    async getGames(socket: Socket, data: any): Promise<any> {
        console.log('getGames');
        try {
            const user: User = await getUserBySocket(socket, this.usersService, usersMap);
            const games: Game[] = this.gameService.getGames();

            const mappedGames = games.map((game: Game) => {
                return {
                    uuid: game.uuid,
                }
            });
            console.log(mappedGames);
            socket.emit('games', mappedGames);
        } catch (error) {
            await sendErrorToClient(socket, 'gameError', error);
        }
    }

    initSinglePlayer(client: Socket, user: User, firstPlayer: boolean): Player {
        const boardPosition = {
            top: 5,
            left: 5,
            width: 1920,
            height: 1080
        }

        const player1Position = {
            top: boardPosition.height / 2 - boardPosition.height / 10,
            left: boardPosition.width / 50,
            width: boardPosition.width * 1.5 / 100,
            height: boardPosition.height / 5
        }

        const player2Position = {
            top: boardPosition.height / 2 - boardPosition.height / 10,
            left: boardPosition.width - boardPosition.width / 50 - boardPosition.width * 1.5 / 100,
            width: boardPosition.width * 1.5 / 100,
            height: boardPosition.height / 5
        }

        let player: Player = null;

        if (firstPlayer) {
            player = new Player(player1Position, '1', user.id, client, boardPosition);
        } else {
            player = new Player(player2Position, '2', user.id, client, boardPosition);
        }

        return player;
    }

    initBall(firstPlayer: Player, secondPlayer: Player): Ball {
        const boardPosition = {
            top: 5,
            left: 5,
            width: 1920,
            height: 1080
        }

        const ballPosition = {
            top: boardPosition.height / 2 - boardPosition.height * 0.75 / 100,
            left: boardPosition.width / 2 - boardPosition.width * 0.75 / 100,
            width: 30,
            height: 30
        }

        return new Ball(ballPosition, boardPosition, firstPlayer, secondPlayer);
    }

    @SubscribeMessage('createDuel')
    async onCreateDuel(client: Socket, payload: any): Promise<any> {
        try {
            const dto: LoginNicknameDto = new LoginNicknameDto(payload.login);
            await validateOrReject(dto);

            const user: User = await getUserBySocket(client, this.usersService, usersMap);
            const targetUser: User = await this.usersService.getUserByNickname(dto.login);

            const duel: Duel = this.gameService.createDuel(user, targetUser);
            const targetSocket: Socket = await getSocketsByUser(targetUser, usersMap);

            if (targetSocket) {
                targetSocket.emit('updateDuels');
            }
        } catch (error) {
            console.log(error);
            await sendErrorToClient(client, 'gameError', error.message);
        }
    }

    @SubscribeMessage('getDuels')
    async onGetDuels(client: Socket, payload: any): Promise<any> {
        try {
            const user: User = await getUserBySocket(client, this.usersService, usersMap);
            const duels: Duel[] = this.gameService.getWaitingDuelsForUser(user);

            const mappedDuels = duels.map(duel => {
                return {
                    from: duel.firstUserNickname,
                    expirationDate: duel.expirationDate,
                }
            });
            client.emit('duels', mappedDuels);
        } catch (error) {
            console.log(error);
            await sendErrorToClient(client, 'gameError', error.message);
        }
    }

    @SubscribeMessage('acceptDuel')
    async onAcceptDuel(client: Socket, payload: any): Promise<any> {
        try {
            const dto: LoginNicknameDto = new LoginNicknameDto(payload.login);
            await validateOrReject(dto);

            const user: User = await getUserBySocket(client, this.usersService, usersMap);
            const targetUser: User = await this.usersService.getUserByNickname(dto.login);
            const duel: Duel = this.gameService.acceptDuel(user, targetUser);

            console.log('duel has been accepted');

            const firstSocket: Socket = await getSocketsByUser(user, usersMap);
            const secondSocket: Socket = await getSocketsByUser(targetUser, usersMap);

            console.log('starting game');
            this.gameService.clearQueue();

            const firstPlayer: Player = this.initSinglePlayer(firstSocket, user, true);
            const secondPlayer: Player = this.initSinglePlayer(secondSocket, targetUser, false);
            const ball: Ball = this.initBall(firstPlayer, secondPlayer);

            const game: Game = new Game(firstPlayer, secondPlayer, ball);

            this.gameService.startGame(game);

            if (firstSocket && firstSocket.connected) {
                firstSocket.emit('sendOnPong');
            }

            if (secondSocket && secondSocket.connected) {
                secondSocket.emit('sendOnPong');
            }

        } catch (error) {
            console.log(error);
            await sendErrorToClient(client, 'duelError', error.message);
        }
    }

    @SubscribeMessage('joinQueue')
    async onJoinQueue(client: Socket, data: any): Promise<any> {
        console.log('joinQueue');
        let user: User = await getUserBySocket(client, this.usersService, usersMap);
        try {
            await this.gameService.joinQueue(client);
        } catch (error) {
            await sendErrorToClient(client, 'joinQueueError', error.message);
            return;
        }

        if (!this.gameService.canJoinGame(client)) {
            client.emit('gameError', "You are already in game go on /pong");
            return;
        }

        console.log('client ' + user.nickname + ' joined the queue');
        if (this.gameService.getQueue().length >= 2) {
            const firstSocket: Socket = this.gameService.getQueue()[0];
            const secondSocket: Socket = this.gameService.getQueue()[1];
            const firstUser: User = await getUserBySocket(firstSocket, this.usersService, usersMap);
            const secondUser: User = await getUserBySocket(secondSocket, this.usersService, usersMap);

            console.log('the queue is full with ' + firstSocket.id + ' and ' + secondSocket.id);
            console.log('starting game');
            this.gameService.clearQueue();

            const firstPlayer: Player = this.initSinglePlayer(firstSocket, firstUser, true);
            const secondPlayer: Player = this.initSinglePlayer(secondSocket, secondUser, false);
            const ball: Ball = this.initBall(firstPlayer, secondPlayer);

            console.log('player1Coord: ' + firstPlayer.coord.coord.top);
            console.log('player1Size : ' + JSON.stringify(firstPlayer.size));
            console.log('player2Coord: ' + JSON.stringify(secondPlayer.coord));
            console.log('player2Size : ' + JSON.stringify(secondPlayer.size));
            console.log('ballCoord: ' + JSON.stringify(ball.coord));
            console.log('ballSize : ' + JSON.stringify(ball.size));


            const game: Game = new Game(firstPlayer, secondPlayer, ball);

            this.gameService.startGame(game);

            if (firstSocket && firstSocket.connected) {
                firstSocket.emit('sendOnPong');
            }

            if (secondSocket && secondSocket.connected) {
                secondSocket.emit('sendOnPong');
            }
        }
    }

    @SubscribeMessage('onKeyInput')
    async onKeyInput(client: Socket, data: any): Promise<any> {
        try {
            // await validateOrReject(new OnKeyInputDto(data.key, data.pressed));

            const game: Game = this.gameService.getCurrentGame(client);

            if (!game) {
                return;
            }

            // const player = this.game.getPlayer(client.id);
            let player;

            if (game.firstPlayer && game.firstPlayer.client.id === client.id)
                player = game.firstPlayer;
            else if (game.secondPlayer && game.secondPlayer.client.id === client.id)
                player = game.secondPlayer;


            if (!player) {
                // await this.sendErrorToClient(client, 'gameError', 'You are not a player in this game');
                return;
            }

            const key = data.key;
            const pressed = data.pressed;

            if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Enter') {
                // await this.sendErrorToClient(client, 'gameError', 'You need to press a valid key');
                return;
            }
            if (key === 'Enter' && game.gameState !== GameState.STARTED && game.firstPlayer && game.secondPlayer) {
                if (game.gameState === GameState.PAUSED) {
                    game.gameState = GameState.STARTED;
                    game.emitToEveryone('newMessage', 'Game on !');
                    game.resetAllPlace();
                    game.moveAll();
                } else {
                    game.startGame();
                }
            } else if (game.firstPlayer && game.secondPlayer) {
                player.keyPress[key] = pressed;
            }

        } catch (error) {
            //TODO: SEND MESSAGE
            console.log(error);
        }
    }

    @SubscribeMessage('create')
    async onCreate(client: Socket, data: any): Promise<any> {

    }

    @SubscribeMessage('join')
    async onJoin(client: Socket, data: any): Promise<any> {

    }

}