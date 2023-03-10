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
import {
    getUserBySocket,
    sendErrorToClient,
    sendSuccessToClient,
    tryHandleConnection,
    tryHandleDisconnect
} from "../../utils";

@WebSocketGateway({
    cors: {
        origin: '*'
    },
    namespace: 'users'
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly usersService: UserService,
                private readonly authService: AuthService
    ) {
    }

    @WebSocketServer() server: Server;

    usersMap: Map<Socket, string> = new Map<Socket, string>();


    async handleConnection(socket: Socket, ...args: any[]): Promise<any> {
        await tryHandleConnection(socket, this.usersMap,
            this.usersService, this.authService,
            'users', ...args);

        await this.sendMyInfo(socket);
    }

    async handleDisconnect(socket: any): Promise<any> {
        await tryHandleDisconnect(socket, this.usersMap, 'channels');
    }

    @SubscribeMessage('getMe')
    async getMe(socket: Socket): Promise<any> {
        await this.sendMyInfo(socket);
    }

    @SubscribeMessage('getFriends')
    async getFriends(socket: Socket): Promise<any> {
        await this.sendMyFriends(socket);
    }

    async sendMyInfo(socket: Socket): Promise<void> {
        try {
            const user: User = await getUserBySocket(socket, this.usersService, this.usersMap);
            socket.emit('me', this.getMappedUser(user));
        } catch (error) {
        }
    }

    async sendMyFriends(socket: Socket): Promise<void> {
        try {
            const user: User = await getUserBySocket(socket, this.usersService, this.usersMap);

            const friends: User[] = await this.usersService.getFriends(user);

            const mappedFriends = friends.map(friend => this.getMappedUser(friend));

            socket.emit('friends', mappedFriends);
        } catch (error) {
        }
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            console.log(user.nickname)
            await this.usersService.changeNickname(user, payload.login);
            await sendSuccessToClient(socket, 'userSuccess', 'Nickname changed successfully');
            console.log('Nickname changed successfully');

            const userAfterChange = await this.usersService.getUserById(user.id);
            console.log(userAfterChange.nickname)
        } catch (error) {
            await sendErrorToClient(socket, 'userError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.followAsFriend(user, targetUser);
        } catch (error) {
            await sendErrorToClient(socket, 'userError', error);
        }
    }

    @SubscribeMessage('unfollowAsFriend')
    async unfollowAsFriend(socket: Socket, payload: any): Promise<any> {
        try {
            // await validateOrReject(new LoginNicknameDto(payload.login));
            //
            // const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            // const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);
            //
            // await this.usersService.unfollowAsFriend(user, targetUser);
        } catch (error) {
            await sendErrorToClient(socket, 'userError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            // const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            const users = await this.usersService.getUsers();
            const randomIndex = Math.floor(Math.random() * users.length);

            const targetUser = await this.usersService.getUserById(users[randomIndex].id);

            await this.usersService.blockUser(user, targetUser);
            socket.emit('userBlocked', {
                id: targetUser.id,
                nickname: targetUser.nickname
            });
            await sendSuccessToClient(socket, 'userSuccess', 'User blocked successfully');
        } catch (error) {
            await sendErrorToClient(socket, 'userError', error);
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

            const user = await getUserBySocket(socket, this.usersService, this.usersMap);
            const targetUser = await this.usersService.getUserByLoginOrNickname(payload.login);

            await this.usersService.unblockUser(user, targetUser);
        } catch (error) {
            await sendErrorToClient(socket, 'userError', error);
        }
    }

    getMappedUser(user: User): any {
        return {
            id: user.id,
            login: user.login,
            nickname: user.nickname,
            status: user.status
        };
    }
}