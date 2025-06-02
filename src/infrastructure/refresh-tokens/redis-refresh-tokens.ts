import { injectable } from "inversify";
import IRefreshTokensStore from "../../services/contracts/refresh-tokens-store";
import Redis, { Redis as RedisClient } from 'ioredis';
import logger from "../../helpers/logger";

@injectable()
export default class RedisRefreshToken implements IRefreshTokensStore {
    private redisClient: RedisClient;

    setup(): void {
        if (process.env.REDIS_SENTINELS) {
            const sentinels = process.env.REDIS_SENTINELS.split(',').map(s => {
                const [host, port] = s.split(':');
                return { host, port: parseInt(port) };
            });

            const masterName = process.env.REDIS_MASTER_NAME
            const password = process.env.REDIS_PASSWORD

            this.redisClient = new Redis({
                sentinels,
                name: masterName,
                password,
                role: 'master', // Ensures writes only go to master
                retryStrategy: (times) => Math.min(times * 50, 2000), // Optional: Auto-reconnect
            });
        } else {
            this.redisClient = new Redis({
                host: process.env.REDIS_URI,
                password: process.env.REDIS_PASSWORD,
                port: parseInt(process.env.REDIS_PORT || '6379'),
                maxRetriesPerRequest: 3,
            });
        }

        this.redisClient.on('connect', () => {
            logger.info(`Redis refresh token running`)
        })

        this.redisClient.on('error', (error) => {
            logger.error(error)
        })

        //this.redisClient.connect();
    }

    async saveRefreshToken(refreshToken: string): Promise<void> {
        try {
            this.redisClient.setex(refreshToken, 3600 * 24, refreshToken);
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