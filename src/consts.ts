import "reflect-metadata";
import {Post} from "./entity/Post";
import {Category} from "./entity/Category";
import {User} from "./users/entity/user.entity";
import {Channel} from "./channel/entity/channel.entity";

export const MAX_LOGIN_LENGTH: number = 8;

export const POSTGRES_NAME = "postgres";

//create a list of all entities in the project:
export const TYPEORM_ENTITIES = [Post, Category, User, Channel];