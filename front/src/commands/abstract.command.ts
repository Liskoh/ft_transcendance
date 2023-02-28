import {SOCKET_SERVER} from "@/consts";

export abstract class AbstractCommand {
    public readonly prefix: string;
    public readonly key: string;

    protected constructor(prefix: string, key: string) {
        this.prefix = prefix;
        this.key = key;
    }

    public emitCommand(object: Object): void {
        SOCKET_SERVER.emit(this.key, object);
    }

    public abstract getCommandData(channelId: number, commandArgs: string[]): Object;

    public abstract getCommandHelp(): string;
}