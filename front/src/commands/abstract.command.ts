import {Socket} from "socket.io-client";

export abstract class AbstractCommand {
    public readonly prefix: string;
    public readonly key: string;

    protected constructor(prefix: string, key: string) {
        this.prefix = prefix;
        this.key = key;
    }

    public emitCommand(object: Object, socket: Socket): void {
        socket.emit(this.key, object);
    }

    public abstract getCommandData(channelId: number, commandArgs: string[]): Object;

    public abstract getCommandHelp(): string;
}