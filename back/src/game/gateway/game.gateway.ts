import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";

@WebSocketGateway(3510,
    {namespace: 'games'}
)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;

    async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    }

    async handleDisconnect(client: Socket): Promise<any> {
    }



}