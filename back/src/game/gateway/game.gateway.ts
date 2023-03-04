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
        let payload: any;
        console.log('New pong connection: ', socket.id);
        try {
            payload = await this.authService.verifyJWTFromSocket(socket);
        } catch (error) {
            socket.disconnect();
            return;
        }

        if (payload) {
            if (Array.from(this.usersMap.values()).includes(payload.username)) {
                socket.disconnect();
                return;
            }

            try {
                await this.usersService.getUserByLogin(payload.username);
            } catch (error) {
                await this.sendErrorToClient(socket, 'channelError', 'User not found');
                return;
            }

            this.usersMap.set(socket, payload.username);
            console.log('New connection: ', socket.id + ' - ' + payload.username);
            console.log("usersMap: ", this.usersMap.size);
            await this.checkClient(socket);
        }
    }

    async handleDisconnect(socket: any): Promise<any> {
        try {
            const username = this.usersMap.get(socket);
            console.log('Disconnected: ', socket.id + ' - ' + username);
            this.usersMap.delete(socket);
        } catch (ex) {
            console.log(ex);
        }
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

    @SubscribeMessage('joinQueue')
    async onJoinQueue(client: Socket, data: any): Promise<any> {
        try {
            await this.gameService.joinQueue(client);
        } catch (error) {
            client.emit('joinQueueError', error)
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

    // private game: Game;
    //
    // initGame() : void {
    //     this.game = new Game();
    //
    // }

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
            this.game.ball = new Ball(data.ballPosition, data.board);
    }

    @SubscribeMessage('onKeyInput')
    async onKeyInput(client: Socket, data: any): Promise<any> {
        console.log('onKeyInput');
        try {
            // await validateOrReject(new OnKeyInputDto(data.key, data.pressed));

            // const game = this.gameService.getCurrentGame(client);

            if (!this.game) {
                await this.sendErrorToClient(client, 'gameError', 'No game found');
                return;
            }

            // const player = this.game.getPlayer(client.id);
            let player;

            if (this.game.firstPlayer && this.game.firstPlayer.client.id === client.id)
                player = this.game.firstPlayer;
            else if (this.game.secondPlayer && this.game.secondPlayer.client.id === client.id)
                player = this.game.secondPlayer;


            if (!player) {
                await this.sendErrorToClient(client, 'gameError', 'You are not a player in this game');
                return;
            }

            const key = data.key;
            const pressed = data.pressed;

            if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Enter') {
                await this.sendErrorToClient(client, 'gameError', 'You need to press a valid key');
                return;
            }
            // if (key === 'Enter' && this.game.gameState === GameState.NOT_STARTED && this.game.firstPlayer && this.game.secondPlayer) {
                if (key === 'Enter' && this.game.firstPlayer && this.game.secondPlayer) {
                    this.game.startGame();
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


    async sendErrorToClient(socket: Socket, name: string, error: any): Promise<void> {
        // if (error instanceof HttpException) {
        //     socket.emit(name, error);
        //     return;
        // }
        //
        // if (error instanceof Object) {
        //     socket.emit(name, {message: "Invalid request, please check your data (/help)"});
        //     return;
        // }

    }


}