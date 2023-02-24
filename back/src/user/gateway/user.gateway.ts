import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {Logger} from "@nestjs/common";
import {UserService} from "../service/user.service";
import {validate, ValidationError} from "class-validator";
import {User} from "../entity/user.entity";
import {LoginNicknameDto} from "../dto/login-nickname.dto";

@WebSocketGateway(
    3000,
    {namespace: 'users'}
)
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly usersService: UserService) {
    }
    @WebSocketServer() server: Server;

    usersMap: Map<Socket, User> = new Map<Socket, User>();

    async getUserBySocket(socket: Socket, update?: boolean): Promise<User> {
        const user = this.usersMap.get(socket);
        if (!user)
            throw new Error('User not found');

        if (update) {
            const updatedUser = await this.usersService.getUserById(user.id);
            this.usersMap.set(socket, updatedUser);
            return updatedUser;
        }

        return user;
    }

    async handleConnection(client: any, ...args: any[]): Promise<any> {
    }

    async handleDisconnect(client: any): Promise<any> {
    }

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
    async changeNickname(socket: Socket, payload: LoginNicknameDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);

            await this.usersService.changeNickname(user, payload.login);
        } catch (error) {
            if (error instanceof ValidationError) {
                socket.emit('changeNicknameValidationError', error);
            }
            socket.emit('changeNicknameError', error);
        }
    }

    /**
     * Send friend request
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('sendFriendRequest')
    async sendFriendRequest(socket: Socket, payload: LoginNicknameDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.sendFriendRequest(user, targetUser);
        } catch (error) {
            socket.emit('userError', error);
        }
    }

    /**
     * Accept friend request
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('acceptFriendRequest')
    async acceptFriendRequest(socket: Socket, payload: LoginNicknameDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.acceptFriendRequest(user, targetUser);
        } catch (error) {
            socket.emit('userError', error);
        }
    }

    /**
     * block user
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('blockUser')
    async blockUser(socket: Socket, payload: LoginNicknameDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.blockUser(user, targetUser);
        } catch (error) {
            socket.emit('userError', error);
        }
    }

    /**
     * Unblock user
     * @param {Socket} socket
     * @param {LoginNicknameDto} payload => {login: string}
     * @returns {Promise<any>}
     */
    @SubscribeMessage('unblockUser')
    async unblockUser(socket: Socket, payload: LoginNicknameDto): Promise<any> {
        try {
            await validate(payload);

            const user = await this.getUserBySocket(socket, true);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.unblockUser(user, targetUser);
        } catch (error) {
            socket.emit('userError', error);
        }
    }

    // handleConnection(client: any, ...args: any[]): any {
    // }
    //
    // handleDisconnect(client: any): any {
    // }

}