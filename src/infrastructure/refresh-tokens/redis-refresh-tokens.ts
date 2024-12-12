import { injectable } from "inversify";
import IRefreshTokensStore from "../../services/contracts/refresh-tokens-store";
import { createClient, RedisClientType } from 'redis';

@injectable()
export default class RedisRefreshToken implements IRefreshTokensStore {
    private redisClient: RedisClientType;

    setup(): void {
        this.redisClient = createClient({
            url: process.env.REDIS_URI,
            password: process.env.REDIS_PASSWORD,
        });

        this.redisClient.on('connect', () => {
            console.log(`redis running on : localhost`)
        })

        this.redisClient.on('error', (error) => {
            console.log(error)
        })

        this.redisClient.connect();
    }

    async saveRefreshToken(refreshToken: string): Promise<void> {
        try {
            this.redisClient.setEx(refreshToken, 3600 * 24, refreshToken);
        } catch (error) {
            throw error;
        }

    }
    async getRefreshToken(refreshToken: string): Promise<string | null> {
        try {
            const token = await this.redisClient.get(refreshToken)
            return token;
        } catch (error) {
            throw error;
        }
    }
    async deleteRefreshToken(refreshToken: string): Promise<void> {
        try {
            this.redisClient.del(refreshToken);
        } catch (error) {
            throw error;
        }
    }

}