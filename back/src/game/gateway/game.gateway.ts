import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {GameService} from "../service/game.service";
import {Game} from "../model/game.model";

@WebSocketGateway(3510,
    {namespace: 'games'}
)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly gameService: GameService
    ) {
    }
    @WebSocketServer() server: Server;

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

    @SubscribeMessage('create')
    async onCreate(client: Socket, data: any): Promise<any> {

    }

    @SubscribeMessage('join')
    async onJoin(client: Socket, data: any): Promise<any> {

    }



}