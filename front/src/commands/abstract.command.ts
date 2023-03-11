import {Socket} from "socket.io-client";
import {SocketType} from "@/utils/socket-type.enum";

export abstract class AbstractCommand {
    public readonly prefix: string;
    public readonly key: string;
    public readonly socketType: SocketType;

    protected constructor(prefix: string, key: string, socketType: SocketType) {
        this.prefix = prefix;
        this.key = key;
        this.socketType = socketType;
    }

    public emitCommand(object: Object, socket: Socket): void {
        socket.emit(this.key, object);
    }

    public abstract getCommandData(channelId: number, commandArgs: string[]): Object;

    public abstract getCommandHelp(): string;
}