"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPEORM_ENTITIES = exports.POSTGRES_NAME = exports.MAX_LOGIN_LENGTH = void 0;
require("reflect-metadata");
const user_entity_1 = require("./users/entity/user.entity");
const channel_entity_1 = require("./channel/entity/channel.entity");
exports.MAX_LOGIN_LENGTH = 8;
exports.POSTGRES_NAME = "postgres";
//create a list of all entities in the project:
exports.TYPEORM_ENTITIES = [user_entity_1.User, channel_entity_1.Channel];
//# sourceMappingURL=consts.js.map