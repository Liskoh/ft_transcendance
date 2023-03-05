import {HttpException, HttpStatus} from "@nestjs/common";
import {Socket} from "socket.io";
import {User} from "./user/entity/user.entity";
import {UserService} from "./user/service/user.service";
import {AuthService} from "./auth/auth.service";

/**
 * send an error to a client
 * @param {Socket} socket
 * @param {string} name
 * @param {any} error
 * @returns {Promise<void>}
 */

export async function sendErrorToClient(socket: Socket, name: string, error: any): Promise<void> {

    if (error instanceof HttpException) {
        socket.emit(name, error);
        return;
    }

    if (error instanceof Object) {
        socket.emit(name, {message: "Invalid request, please check your data (/help)"});
        return;
    }
}

/**
 * send a success message to a client
 * @param {Socket} socket
 * @param {string} name
 * @param {string} message
 * @returns {Promise<void>}
 */
export async function sendSuccessToClient(socket: Socket, name: string, message: string): Promise<void> {
    socket.emit(name, {message: message});
}

export async function getUserBySocket(socket: Socket, userService: UserService, map: Map<Socket, string>): Promise<User> {
    let user: User;
    try {
        const login: string = map.get(socket);
        user = await userService.getUserByLogin(login);
    } catch (error) {
        throw new HttpException(
            'User not found',
            HttpStatus.NOT_FOUND,
        )
    }

    return user;
}

export async function getSocketsByUser(user: User, map: Map<Socket, string>): Promise<Socket> {
    for (const [key, value] of map.entries()) {
        if (value === user.login)
            return key;
    }

    throw new HttpException(
        'Socket not found',
        HttpStatus.NOT_FOUND,
    );
}

export async function tryHandleConnection(socket: Socket, map: Map<Socket, string>,
                                          usersService: UserService, authService: AuthService,
                                          namespace: string, ...args: any[]): Promise<boolean> {
    let payload: any;
    try {
        payload = await authService.verifyJWTFromSocket(socket);
        //in case if user already connected for non-duplicate connections
        if (Array.from(map.values()).includes(payload.username)) {
            socket.disconnect();
            return;
        }
        //we check if user exists
        const user: User = await usersService.getUserByLogin(payload.username);
    } catch (error) {
        socket.disconnect();
        return;
    }

    map.set(socket, payload.username);
    console.log('------------------------');
    console.log(`\x1b[36mNew connection:\x1b[0m id => \x1b[33m${socket.id}\x1b[0m \x1b[32mlogin => \x1b[0m${payload.username} \x1b[35mnamespace => \x1b[0m${namespace}`);
    console.log(`\x1b[36mConnected users:\x1b[0m ${map.size}`);
    console.log('------------------------');
    return true;
}

export async function tryHandleDisconnect(socket: Socket, map: Map<Socket, string>, namespace: string): Promise<any> {
    try {
        const username = map.get(socket);
        if (username) {
            map.delete(socket);
            console.log('------------------------');
            console.log(`\x1b[36mDisconnected:\x1b[0m id => \x1b[33m${socket.id}\x1b[0m \x1b[32mlogin => \x1b[0m${username} \x1b[35mnamespace => \x1b[0m${namespace}`);
            console.log(`\x1b[36mConnected users:\x1b[0m ${map.size}`);
            console.log('------------------------');
        }
    } catch (ex) {
    }
}