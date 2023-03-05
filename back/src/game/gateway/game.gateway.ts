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
import {OnKeyInputDto} from "../dto/on-key-input.dto";
import {AuthService} from "../../auth/auth.service";
import {UserService} from "../../user/service/user.service";
import {HttpException} from "@nestjs/common";
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

    private usersMap: Map<Socket, string> = new Map();

    async handleConnection(socket: Socket, ...args: any[]): Promise<any> {
        await tryHandleConnection(socket, this.usersMap, this.usersService, this.authService, 'game', ...args);
        await this.checkClient(socket);
    }


    async handleDisconnect(socket: any): Promise<any> {
        await tryHandleDisconnect(socket, this.usersMap, 'game');
    }

    private game: Game = new Game(null, null, null);

    async checkClient(client: Socket): Promise<any> {
        // const game = this.gameService.getCurrentGame(client);
        //
        // if (game === null) {
        //     game = new Game(null, null, null);
        // }
        if (!this.game.firstPlayer) {
            client.emit('nbrPlayer', {
                nbrPlayer: 1,
            })
        } else if (!this.game.secondPlayer) {
            client.emit('nbrPlayer', {
                nbrPlayer: 2,
            })
        }
    }

    @SubscribeMessage('createDuel')
    async onCreateDuel(client: Socket, payload: any): Promise<any> {
        // console.log('createDuel', payload);
        try {
            const dto: LoginNicknameDto = new LoginNicknameDto(payload.login);
            await validateOrReject(dto);

            const user: User = await getUserBySocket(client, this.usersService, this.usersMap);
            const targetUser: User = await this.usersService.getUserByNickname(dto.login);

            const duel: Duel = this.gameService.createDuel(user, targetUser);

            const targetSocket: Socket = await getSocketsByUser(targetUser, this.usersMap);

            if (targetSocket) {
                targetSocket.emit('updateDuels');
            }
        } catch (error) {
            console.log(error);
            await sendErrorToClient(client, 'duelError', error.message);
        }
    }

    @SubscribeMessage('getDuels')
    async onGetDuels(client: Socket, payload: any): Promise<any> {
        try {
            const user: User = await getUserBySocket(client, this.usersService, this.usersMap);
            const duels: Duel[] = this.gameService.getWaitingDuelsForUser(user);

            client.emit('duels', duels.map(duel => {
                return {
                    from: duel.firstUserNickname,
                    expirationDate: duel.expirationDate,
                }
            }));
        } catch (error) {
            console.log(error);
            await sendErrorToClient(client, 'duelError', error.message);
        }
    }

    @SubscribeMessage('acceptDuel')
    async onAcceptDuel(client: Socket, payload: any): Promise<any> {
        try {
            const dto: LoginNicknameDto = new LoginNicknameDto(payload.login);
            await validateOrReject(dto);

            const user: User = await getUserBySocket(client, this.usersService, this.usersMap);
            const targetUser: User = await this.usersService.getUserByNickname(dto.login);

            const duel: Duel = this.gameService.acceptDuel(user, targetUser);
        } catch (error) {
            console.log(error);
            await sendErrorToClient(client, 'duelError', error.message);
        }
    }

    @SubscribeMessage('joinQueue')
    async onJoinQueue(client: Socket, data: any): Promise<any> {
        try {
            await this.gameService.joinQueue(client);
        } catch (error) {
            await sendErrorToClient(client, 'joinQueueError', error.message);
            return;
        }

        if (this.gameService.getQueue().length >= 2) {
            const firstSocketId = this.gameService.getQueue()[0];
            const secondSocketId = this.gameService.getQueue()[1];

            this.gameService.clearQueue();

            const game = null;

            if (!this.gameService.canJoinGame(client, game)) {
                client.emit('joinQueueError', 'You can\'t join this game');
                return;
            }

            //game.start avec socket etc

            for (const socketId in this.server.sockets.sockets) {
                if (socketId === firstSocketId) {
                    this.server.to(socketId).emit('gameFound', game);
                } else if (socketId === secondSocketId) {
                    this.server.to(socketId).emit('gameFound', game);
                }
            }
        }
    }


    @SubscribeMessage('playerJoin')
    async onPlayerJoin(client: Socket, data: any): Promise<any> {

        // const game = this.gameService.getCurrentGame(client);

        if (data.id === 1) {
            console.log('Player ' + data.id + 'join');
            this.game.firstPlayer = new Player(data.position, data.id, client, data.board);
        } else if (data.id === 2) {
            console.log('Player ' + data.id + 'join');
            this.game.secondPlayer = new Player(data.position, data.id, client, data.board);
        }

        if (!this.game.ball && this.game.firstPlayer && this.game.secondPlayer)
            this.game.ball = new Ball(data.ballPosition, data.board, this.game.firstPlayer, this.game.secondPlayer);
    }

    @SubscribeMessage('onKeyInput')
    async onKeyInput(client: Socket, data: any): Promise<any> {
        try {
            // await validateOrReject(new OnKeyInputDto(data.key, data.pressed));

            // const game = this.gameService.getCurrentGame(client);

            if (!this.game) {
                // await this.sendErrorToClient(client, 'gameError', 'No game found');
                return;
            }

            // const player = this.game.getPlayer(client.id);
            let player;

            if (this.game.firstPlayer && this.game.firstPlayer.client.id === client.id)
                player = this.game.firstPlayer;
            else if (this.game.secondPlayer && this.game.secondPlayer.client.id === client.id)
                player = this.game.secondPlayer;


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
            if (key === 'Enter' && this.game.gameState !== GameState.STARTED && this.game.firstPlayer && this.game.secondPlayer) {
                if (this.game.gameState === GameState.PAUSED) {
                    this.game.gameState = GameState.STARTED;
                    this.game.emitToEveryone('newMessage', 'Game on !');
                    this.game.resetAllPlace();
                    this.game.moveAll();
                } else {
                    this.game.startGame();
                }
            } else if (this.game.firstPlayer && this.game.secondPlayer) {
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