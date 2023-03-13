import {GameLevel} from "../enum/game-level.enum";

export interface Duel {
    firstUserId: number;
    secondUserId: number;
    firstUserNickname: string;
    secondUserNickname: string;
    gameLevel: GameLevel;
    accepted: boolean;
    expirationDate: Date;
}