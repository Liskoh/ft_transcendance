// import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "../entity/user.entity";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {RegisterUserDto} from "../dto/register-user.dto";
import {validate} from "class-validator";
import {ChangeLoginUserDto} from "../dto/change-login-user.dto";
import {ChannelType} from "../../channels/enum/channel-type.enum";

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
     * save and return new user (using dto)
     * @returns {Promise<User>}
     * @param user
     **/
    async saveNewUser(user: User): Promise<User> {
        let existingUser = await this.getUserByLogin(user.login);

        if (existingUser !== null) {
            // throw new Error("User with this login already exists"); //TODO: check what we have to do here ?
            return null;
        }

        const dto = new RegisterUserDto(user.login, user.email);

        try {
            await validate(dto);
            console.log("validation succeed");
            await this.usersRepository.save(user);
            return user;
        } catch (errors) {
            throw new HttpException(errors, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Change user login and check if it is unique
     * @param user
     * @param newLogin
     * @returns {Promise<User | undefined>}
     */
    async changeLogin(user: User, newLogin: string): Promise<User | undefined> {

        for (const u of await this.getUsers()) {
            if (u.login === newLogin && u.id !== user.id) {
                throw new HttpException(
                    "User with this login already exists",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        const dto = new ChangeLoginUserDto(newLogin);

        try {
            await validate(dto);
            console.log("validation succeed");

            user.login = newLogin;
            await this.usersRepository.save(user);

            return user;
        } catch (errors) {
            throw new HttpException(errors, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Send friend request from one user to another
     * @param {User} from
     * @param {User} to
     * @returns {Promise<void>}
     **/
    async sendFriendRequest(from: User, to: User): Promise<void> {
        if (this.isSameUser(from, to))
            throw new HttpException(
                "You can't send friend request to yourself",
                HttpStatus.BAD_REQUEST
            );

        if (to.pendingFriendRequests.includes(from.id))
            throw new HttpException(
                "You are already friends with this user",
                HttpStatus.BAD_REQUEST
            );

        if (to.pendingFriendRequests.includes(from.id))
            throw new HttpException(
                "You already sent friend request to this user",
                HttpStatus.BAD_REQUEST
            );

        to.pendingFriendRequests.push(from.id);
        await this.usersRepository.save(to);
    }

    /**
     * Accept friend request from one user to another
     * @param {User} from
     * @param {User} to
     * @returns {Promise<void>}
     */
    async acceptFriendRequest(from: User, to: User): Promise<User> {

        if (this.isSameUser(from, to))
            throw new HttpException(
                "You can't accept friend request from yourself",
                HttpStatus.BAD_REQUEST
            );

        if (!from.pendingFriendRequests.includes(to.id))
            throw new HttpException(
                "You don't have friend request from this user",
                HttpStatus.BAD_REQUEST
            );

        if (from.friendsList.includes(to.id))
            throw new HttpException(
                "You are already friends with this user",
                HttpStatus.BAD_REQUEST
            );

        //add to friends list
        from.friendsList.push(to.id);
        to.friendsList.push(from.id);

        //remove pending friend requests
        from.pendingFriendRequests.splice(from.pendingFriendRequests.indexOf(to.id), 1);

        //saving from and to
        await this.usersRepository.save(to);
        return await this.usersRepository.save(from);
    }

    /**
     * Bock other user
     * @param {User} from
     * @param {User} to
     * @returns {Promise<User>}
     */
    async blockUser(from: User, to: User): Promise<User> {

        if (this.isSameUser(from, to))
            throw new HttpException(
                "You can't block yourself",
                HttpStatus.BAD_REQUEST
            );

        if (from.blockedList.includes(to.id))
            throw new HttpException(
                "You already blocked this user",
                HttpStatus.BAD_REQUEST
            );

        from.blockedList.push(to.id);

        return await this.usersRepository.save(from);
    }

    // getChannelCount(user: User): number {
    //     let count = 0;
    //
    //     for (const channel of user.channels) {
    //         if (channel.channelType !== ChannelType.DM) {
    //             count++;
    //         }
    //     }
    //
    //     return count;
    // }

    /**
     * check if two users are the same
     * @param user1
     * @param user2
     * @returns {boolean}
     **/
    isSameUser(user1: User, user2: User): boolean {
        return user1.id === user2.id;
    }

    /**
     * Create and return user
     * @param login
     * @param mail
     * @returns {User}
     **/
    createUser(login: string, mail: string): User {
        return new User(login, mail);
    }

}
