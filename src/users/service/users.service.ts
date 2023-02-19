// import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "../entity/user.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User)
                private usersRepository: Repository<User>
    ) {
    }

    /**
     * Returns all users
     * @param {number} id
     * @returns {Promise<User[]>}
     */
    async getUsers(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    /**
     find and return user by id
     * @param {number} id
     * @returns {Promise<User>}
     **/
    async getUserById(id: number): Promise<User> {
        return await this.usersRepository.findOneBy({id: id});
    }

    /**
     * find and return user by login
     * @param {string} login
     * @returns {Promise<User>}
     */
    async getUserByLogin(login: string): Promise<User> {
        return await this.usersRepository.findOneBy({login: login});
    }

    /**
     * delete and return user by id
     * @param {number} id
     * @returns {Promise<User>}
     */
    async deleteUserById(id: number): Promise<User> {
        const user = await this.getUserById(id);

        if (user === null) {
            // throw new Error("User not found"); //TODO: check what we have to do here ?
            return;
        }

        return await this.deleteUser(user);
    }

    /**
     * Delete and return user
     * @param {User} user
     * @returns {Promise<User>}
     **/
    async deleteUser(user: User): Promise<User> {
        return await this.usersRepository.remove(user);
    }

    /**
     * Create and return user
     * @param {string} login
     * @returns {Promise<User>}
     **/
    async createUser(login: string): Promise<User> {
        let existingUser = await this.getUserByLogin(login);

        if (existingUser !== null) {
            // throw new Error("User with this login already exists"); //TODO: check what we have to do here ?
            return null;
        }

        const user = new User(login);
        await this.usersRepository.save(user);

        return user;
    }

    /**
     * Send friend request from one user to another
     * @param {User} from
     * @param {User} to
     * @returns {Promise<void>}
     **/
    async sendFriendRequest(from: User, to: User) : Promise<void> {
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
        await this.usersRepository.save(to);
    }

    /**
     * Accept friend request from one user to another
     * @param {User} from
     * @param {User} to
     * @returns {Promise<void>}
     */
    async acceptFriendRequest(from: User, to: User) : Promise<void> {
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

        await this.usersRepository.save(from);
        await this.usersRepository.save(to);
    }

    /**
     * check if two users are the same
     * @param user1
     * @param user2
     * @returns {boolean}
     **/
    isSameUser(user1: User, user2: User) : boolean {
        return user1.id === user2.id;
    }

}
