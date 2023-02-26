import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {validate, validateOrReject, ValidationError} from "class-validator";
import {GameService} from "../service/game.service";
import {Game} from "../model/game.model";
import {OnKeyInputDto} from "../dto/on-key-input.dto";

@WebSocketGateway(
    {
        cors: {
            origin: '*'
        }
    }
)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly gameService: GameService
    ) {
    }
    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    }

    async handleDisconnect(client: Socket): Promise<any> {
        const game = this.gameService.getCurrentGame(client);

        if (!game)
            return

        //stop the match
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

    @SubscribeMessage('onKeyInput')
    async onKeyInput(client: Socket, data: any): Promise<any> {
        try {
            await validateOrReject(new OnKeyInputDto(data.key, data.pressed));

            const game = this.gameService.getCurrentGame(client);

            if (!game) {
                client.emit('gameError', 'You are not in a game');
                return;
            }

            const player = game.getPlayer(client.id);

            if (!player) {
                client.emit('gameError', 'You are not in this game');
                return;
            }

            const key = data.key;
            const pressed = data.pressed;

            if (key !== 'ArrowUp' && key !== 'ArrowDown') {
                client.emit('gameError', 'Invalid key');
                return;
            }

            player.keyPress[key] = pressed;
        } catch (error) {
            //TODO: SEND MESSAGE
        }
    }

    @SubscribeMessage('create')
    async onCreate(client: Socket, data: any): Promise<any> {

    }

    @SubscribeMessage('join')
    async onJoin(client: Socket, data: any): Promise<any> {

    }



}