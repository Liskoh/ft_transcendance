
export interface Duel {
    firstUserId: number;
    secondUserId: number;
    firstUserNickname: string;
    secondUserNickname: string;
    accepted: boolean;
    expirationDate: Date;
}