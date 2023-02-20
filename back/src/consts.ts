import "reflect-metadata";
import {User} from "./users/entity/user.entity";
import {Channel} from "./channels/entity/channel.entity";
import {Message} from "./channels/entity/message.entity";
import {Ban} from "./channels/entity/ban.entity";
import {Mute} from "./channels/entity/mute.entity";
import {MatchHistory} from "./game/entity/match-history.entity";

export const MAX_LOGIN_LENGTH: number = 8;
export const MAX_PASSWORD_LENGTH: number = 20;
export const MIN_PASSWORD_LENGTH: number = 3;

export const POSTGRES_NAME = "postgres";

//create a list of all entities in the project:
export const TYPEORM_ENTITIES = [User, Channel, Message, Ban, Mute, MatchHistory];

export const MAX_SIZE_LOGIN_ERROR = "Login is too long";