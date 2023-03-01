import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {HttpException, Logger, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {UserService} from "../service/user.service";
import {validate, validateOrReject, ValidationError} from "class-validator";
import {User} from "../entity/user.entity";
import {LoginNicknameDto} from "../dto/login-nickname.dto";
import {JwtService} from "@nestjs/jwt";
import {AuthService} from "../../auth/auth.service";
import {AuthGuard} from "@nestjs/passport";

// @WebSocketGateway(
//     3500,
//     {namespace: 'users'}
// )
@WebSocketGateway({
    cors: {
        origin: '*'
    },
    // namespace: 'users'
})
@WebSocketGateway(
    {namespace: 'users'}
)
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly usersService: UserService,
                private readonly authService: AuthService
    ) {
        // super();
        // this.use(this.authMiddleware);
    // ){
    }
    @WebSocketServer() server: Server;

    usersMap: Map<Socket, number> = new Map<Socket, number>();


    async handleConnection(client: Socket, ...args: any[]): Promise<any> {
        // console.log('connected ' + client.id);

        // console.log('Client connected:', client['user']);
        //
        // try {
        //     const user = await this.authService.getUserByWebSocket(client);
        //     client.emit('user', user);
        // } catch (e) {
        //     console.log(e);
        // }
    }

    async handleDisconnect(client: any): Promise<any> {
    }

    async getUserBySocket(socket: Socket): Promise<User> {
        const userId = this.usersMap.get(socket);
        if (!userId) {
            this.usersMap.set(socket, 1);
        }

        const users = await this.usersService.getUsers();
        const randomIndex = Math.floor(Math.random() * users.length);

        const user = await this.usersService.getUserById(randomIndex);

        if (!user)
            throw new Error('User not found')

        return user;
    }

    async sendErrorToClient(socket: Socket, name: string, error: any) : Promise<void> {
        console.log(socket.id + ' socketId send an invalid request: ' + error);

        if (error instanceof HttpException) {
            socket.emit(name, error);
            return;
        }

        if (error instanceof Object) {
            socket.emit(name, {message: "Invalid request, please check your data"});
            return;
        }
    }
    // @UseGuards(AuthGuard('jwt'))

    @SubscribeMessage('register')
    async register(client: any, payload: any): Promise<any> {

    }

    /**
     * Change user nickname
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('changeNickname')
    async changeNickname(socket: Socket, payload: any): Promise<any> {
        try {
            await validateOrReject(new LoginNicknameDto(payload.login));

            const user = await this.getUserBySocket(socket);

            await this.usersService.changeNickname(user, payload.login);
        } catch (error) {
            await this.sendErrorToClient(socket, 'userError', error);
        }
    }

    /**
     * Accept friend request
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('followAsFriend')
    async followAsFriend(socket: Socket, payload: any): Promise<any> {
        try {
            await validateOrReject(new LoginNicknameDto(payload.login));

            const user = await this.getUserBySocket(socket);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.followAsFriend(user, targetUser);
        } catch (error) {
            await this.sendErrorToClient(socket, 'userError', error);
        }
    }

    /**
     * block user
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('blockUser')
    async blockUser(socket: Socket, payload: any): Promise<any> {
        try {
            await validateOrReject(new LoginNicknameDto(payload.login));

            const user = await this.getUserBySocket(socket);
            // const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            const users = await this.usersService.getUsers();
            const randomIndex = Math.floor(Math.random() * users.length);

            const targetUser = await this.usersService.getUserById(users[randomIndex].id);

            await this.usersService.blockUser(user, targetUser);
            socket.emit('userBlocked', {
                id: targetUser.id,
                nickname: targetUser.nickname
            });
        } catch (error) {
            await this.sendErrorToClient(socket, 'userError', error);
        }
    }

    /**
     * Unblock user
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('unblockUser')
    async unblockUser(socket: Socket, payload: any): Promise<any> {
        try {
            await validateOrReject(new LoginNicknameDto(payload.login));

            const user = await this.getUserBySocket(socket);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.unblockUser(user, targetUser);
        } catch (error) {
            await this.sendErrorToClient(socket, 'userError', error);
        }
    }
}