import { delAsync, getAsync, setAsync } from "../config/redis.js"
import { v4 as uuidv4 } from 'uuid'
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "./constants.js"

export const createNewTokens = async(userId) => {
    const newAccessToken = uuidv4()
    const newRefreshToken = uuidv4()

    await setAsync(`accessToken:${userId}`, newAccessToken, 'EX', ACCESS_TOKEN_EXPIRY)
    await setAsync(`refreshToken:${userId}`, newRefreshToken, 'EX', REFRESH_TOKEN_EXPIRY)

    return { newAccessToken, newRefreshToken}
}

export const deleteOldTokens = async(userId) => {
    await delAsync(`accessToken:${userId}`)
    await delAsync(`refreshToken:${userId}`)
}

export const getStoredTokens = async(userId) => {
    const accessToken = await getAsync(`accessToken:${userId}`)
    const refreshToken = await getAsync(`refreshToken:${userId}`)
    return {accessToken, refreshToken}
}