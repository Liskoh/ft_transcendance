"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
// import {Injectable} from "@nestjs/common";
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entity/user.entity");
const common_1 = require("@nestjs/common");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    /**
     * Returns all users
     * @param {number} id
     * @returns {Promise<User[]>}
     */
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.usersRepository.find();
        });
    }
    /**
     find and return user by id
     * @param {number} id
     * @returns {Promise<User>}
     **/
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.usersRepository.findOneBy({ id: id });
        });
    }
    /**
     * find and return user by login
     * @param {string} login
     * @returns {Promise<User>}
     */
    getUserByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.usersRepository.findOneBy({ login: login });
        });
    }
    /**
     * delete and return user by id
     * @param {number} id
     * @returns {Promise<User>}
     */
    deleteUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUserById(id);
            if (user === null) {
                // throw new Error("User not found"); //TODO: check what we have to do here ?
                return;
            }
            return yield this.deleteUser(user);
        });
    }
    /**
     * Delete and return user
     * @param {User} user
     * @returns {Promise<User>}
     **/
    deleteUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.usersRepository.remove(user);
        });
    }
    /**
     * Create and return user
     * @param {string} login
     * @returns {Promise<User>}
     **/
    createUser(login) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingUser = yield this.getUserByLogin(login);
            if (existingUser !== null) {
                // throw new Error("User with this login already exists"); //TODO: check what we have to do here ?
                return null;
            }
            const user = new user_entity_1.User(login);
            yield this.usersRepository.save(user);
            return user;
        });
    }
    /**
     * Send friend request from one user to another
     * @param {User} from
     * @param {User} to
     * @returns {Promise<void>}
     **/
    sendFriendRequest(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSameUser(from, to)) {
                // throw new Error("You can't send friend request to yourself");
                return;
            }
            if (to.pendingFriendRequests.includes(from.id)) {
                // throw new Error("You already sent friend request to this user");
                return;
            }
            if (to.pendingFriendRequests.includes(from.id)) {
                // throw new Error("You are already friends with this user");
                return;
            }
            to.pendingFriendRequests.push(from.id);
            yield this.usersRepository.save(to);
        });
    }
    /**
     * Accept friend request from one user to another
     * @param {User} from
     * @param {User} to
     * @returns {Promise<void>}
     */
    acceptFriendRequest(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSameUser(from, to)) {
                // throw new Error("You can't accept friend request from yourself");
                return;
            }
            if (!from.pendingFriendRequests.includes(to.id)) {
                // throw new Error("You don't have friend request from this user");
                return;
            }
            if (from.friendsList.includes(to.id)) {
                // throw new Error("You are already friends with this user");
                return;
            }
            //add to friends list
            from.friendsList.push(to.id);
            to.friendsList.push(from.id);
            //remove pending friend requests
            from.pendingFriendRequests.splice(from.pendingFriendRequests.indexOf(to.id), 1);
            yield this.usersRepository.save(from);
            yield this.usersRepository.save(to);
        });
    }
    /**
     * check if two users are the same
     * @param user1
     * @param user2
     * @returns {boolean}
     **/
    isSameUser(user1, user2) {
        return user1.id === user2.id;
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map