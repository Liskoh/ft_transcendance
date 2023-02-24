import "reflect-metadata";
import {User} from "./user/entity/user.entity";
import {Channel} from "./channel/entity/channel.entity";
import {Message} from "./channel/entity/message.entity";
import {MatchHistory} from "./game/entity/match-history.entity";
import {Punishment} from "./channel/entity/punishment.entity";

export const MIN_LOGIN_LENGTH: number = 3;
export const MAX_LOGIN_LENGTH: number = 8;
export const MAX_PASSWORD_LENGTH: number = 20;
export const MIN_PASSWORD_LENGTH: number = 3;

export const MAX_CHANNELS_PER_USER: number = 6;
export const MAX_MESSAGE_LENGTH: number = 100;
export const MIN_MESSAGE_LENGTH: number = 1;

export const MAX_CHANNEL_NAME_LENGTH: number = 15;
export const MIN_CHANNEL_NAME_LENGTH: number = 1;

export const CHAT_COOLDOWN_IN_MILLISECONDS: number = 3000;

export const BCRYPT_SALT_ROUNDS = 10;
export const POSTGRES_NAME = "postgres";

export const MAX_MATCHES: number = 10;

//create a list of all entities in the project:
export const TYPEORM_ENTITIES = [User, Channel, Message, Punishment, MatchHistory];

export const MAX_SIZE_LOGIN_ERROR = "Login is too long";

