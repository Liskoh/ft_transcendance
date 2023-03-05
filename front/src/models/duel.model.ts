
export class Duel {
    constructor(from: string, expirationDate: Date) {
        this.from = from;
        this.expirationDate = expirationDate;
    }

    from: string;
    expirationDate: Date;
}