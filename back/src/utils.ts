import {HttpException} from "@nestjs/common";
import {Socket} from "socket.io";

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