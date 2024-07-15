import redis from 'redis';
import { promisify } from 'util';

const redisClient = redis.createClient({ legacyMode: true });

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.connect().catch(console.error); // Connect the client

export const getAsync = promisify(redisClient.get).bind(redisClient);
export const setAsync = promisify(redisClient.set).bind(redisClient);
export const delAsync = promisify(redisClient.del).bind(redisClient);

export { redisClient };
