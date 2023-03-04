// import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "../entity/user.entity";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {validate} from "class-validator";
import {LoginNicknameDto} from "../dto/login-nickname.dto";
import {Socket} from "socket.io";
import {AuthService} from "../../auth/auth.service";

@Injectable()
export class UserService {

    constructor(@InjectRepository(User)
                private usersRepository: Repository<User>,
                // private readonly authService: AuthService
    ) {
    }

    /**
     * Returns all user
     * @returns {Promise<User[]>}
     */
    async getUsers(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async saveUser(user: User): Promise<User> {
        try {
            return await this.usersRepository.save(user);
        } catch (e) {
            return null;
        }
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
     * find and return user by nickname
     * @param {string} nickname
     * @returns {Promise<User>}
     */
    async getUserByNickname(nickname: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({nickname: nickname});

        if (!user)
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );

        return user;
    }

    /**
     * find and return user by login or nickname
     * @param {string} login
     * @returns {Promise<User>}
     */
    async getUserByLoginOrNickname(login: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({login: login, nickname: login});

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
     * @param {string} login => {login: string}
     * @returns {Promise<User>}
     */
    async saveNewUser(login: string): Promise<User> {
        const user = new User(login);

        //generate random uid:


        return await this.usersRepository.save(user);
    }

    /**
     * Change user login and check if it is unique
     * @param {User} user
     * @param {string} nickname
     * @returns {Promise<User>}
     */
    async changeNickname(user: User, nickname: string): Promise<User> {
        for (const u of await this.getUsers()) {
            if (u.nickname === nickname || u.login === nickname) {
                throw new HttpException(
                    "User with this nickname or login already exists",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        user.nickname = nickname;
        return await this.usersRepository.save(user);
    }

    /**
     * Accept friend request from one user to another
     * @param {User} from
     * @param {User} to
     * @returns {Promise<void>}
     */
    async followAsFriend(from: User, to: User): Promise<User> {

        if (this.isSameUser(from, to))
            throw new HttpException(
                "You can't accept friend request from yourself",
                HttpStatus.BAD_REQUEST
            );

        if (from.friendsList.includes(to.id))
            throw new HttpException(
                "You are already friends with this user",
                HttpStatus.BAD_REQUEST
            );

        //add to friends list
        from.friendsList.push(to.id);

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

    /**
     * Unblock other user
     * @param {User} from
     * @param {User} to
     * @returns {Promise<User>}
     */
    async unblockUser(from: User, to: User): Promise<User> {
            if (this.isSameUser(from, to))
                throw new HttpException(
                    "You can't unblock yourself",
                    HttpStatus.BAD_REQUEST
                );

            if (!from.blockedList.includes(to.id))
                throw new HttpException(
                    "You didn't block this user",
                    HttpStatus.BAD_REQUEST
                );

            from.blockedList.splice(from.blockedList.indexOf(to.id), 1);

            return await this.usersRepository.save(from);
    }

    /**
     * check if two user are the same
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
    createUser(login: string): User {
        return new User(login);
    }

}
