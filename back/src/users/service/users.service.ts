// import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "../entity/user.entity";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {RegisterUserDto} from "../dto/register-user.dto";
import {validate, ValidationError} from "class-validator";
import {ChangeLoginUserDto, ChangeNicknameDto} from "../dto/change-nickname.dto";
import {ChannelType} from "../../channels/enum/channel-type.enum";

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User)
                private usersRepository: Repository<User>
    ) {
    }

    /**
     * Returns all users
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
        const user = await this.usersRepository.findOneBy({id: id});

        if (!user)
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );

        return user;
    }

    /**
     * find and return user by login
     * @param {string} login
     * @returns {Promise<User>}
     */
    async getUserByLogin(login: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({login: login});

        if (!user)
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );

        return user;
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
     * @param {RegisterUserDto} dto
     * @returns {Promise<User>}
     */
    async saveNewUser(dto: RegisterUserDto): Promise<User> {
        try {
            await validate(dto);
        } catch (errors) {
            throw new HttpException(
                errors,
                HttpStatus.BAD_REQUEST
            );
        }
        let existingUser;

        //if user is unique
        try {
            existingUser = await this.getUserByLogin(dto.login);
        } catch (error) {
            existingUser = null;
        }

        if (existingUser !== null)
            throw new HttpException(
                "User with this login already exists",
                HttpStatus.BAD_REQUEST
            );

        const user = new User(dto.login);

        await this.usersRepository.save(user);
        return user;
    }

    /**
     * Change user login and check if it is unique
     * @param {User} user
     * @param {RegisterUserDto} dto
     * @returns {Promise<User>}
     */
    async changeNickname(user: User, dto: ChangeNicknameDto): Promise<User> {
        try {
            await validate(dto);
        } catch (errors) {
            throw new HttpException(
                errors,
                HttpStatus.BAD_REQUEST
            );
        }

        for (const u of await this.getUsers()) {
            if (u.nickname === dto.login) {
                throw new HttpException(
                    "User with this nickname already exists",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        user.nickname = dto.login;
        return await this.usersRepository.save(user);
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

        if (this.isBlockedByUser(from, to))
            throw new HttpException(
                "You are blocked by this user",
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

    isBlockedByUser(from: User, to: User): boolean {
        return from.blockedList.includes(to.id);
    }

    /**
     * Create and return user
     * @param login
     * @param mail
     * @returns {User}
     **/
    createUser(login: string, mail: string): User {
        return new User(login);
    }

}
