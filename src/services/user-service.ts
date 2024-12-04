import { UserDto } from "../domain/dto/user-dto";
import { User } from "../domain/entities/user";
import IUserRepository from "../domain/repositories/user-repository";
import IPasswordManager from "./contracts/password-manager";
import UserMapper from "../domain/mapper/user-mapper";
import IUserService from "./contracts/user-service-contract";
import { inject, injectable } from "inversify";
import { TYPES } from "../dependency-injection/types";

@injectable()
export default class UserService implements IUserService {
    private userRepository: IUserRepository;
    private passwordManager: IPasswordManager;
    constructor(
        @inject(TYPES.IUserRepository) userRepository: IUserRepository,
        @inject(TYPES.IPasswordManager) passwordManager: IPasswordManager
    ) {
        this.userRepository = userRepository;
        this.passwordManager = passwordManager;
    }

    async createUser(userDto: UserDto): Promise<UserDto> {

        // check if the user already exists
        const userAlreadyExists = await this.userRepository.getUserByEmail(userDto.email).catch(() => {
            throw new Error('Error createing user');
        });

        if (userAlreadyExists) {
            throw new Error('User already exists');
        }

        try {
            // hash the password
            const hashedPassword = await this.passwordManager.hashPassword(userDto.password);

            // create the user
            const user = User.create({
                email: userDto.email,
                password: hashedPassword,
                role: userDto.role
            });

            // save user
            const newUser = await this.userRepository.createUser(user);

            return UserMapper.toDto(newUser);
        } catch (error) {
            throw new Error('Error creating user');
        }
    }
}