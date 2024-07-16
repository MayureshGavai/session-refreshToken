import { delAsync, getAsync, setAsync } from "../config/redis.js";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, USER_SESSION_PREFIX } from "../utils/constants.js";
import { v4 as uuidv4 } from 'uuid'



// export const validateSession = async (req, res, next) => {
//     const sessionId = req.cookies['connect.sid'];

//     if (!sessionId) {
//         return res.redirect('/login?error=Session expired');
//     }

//     const userId = req.session.userId;
//     if (!userId) {
//         return res.redirect('/login?error=Invalid session');
//     }

//     const storedSessionId = await getAsync(`${USER_SESSION_PREFIX}${userId}`);

//     if (storedSessionId !== sessionId) {
//         return res.redirect('/login?error=Session expired');
//     }

//     next();
// };

export const validateSession = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        // return res.status(401).json({ error: 'Session is invalid or has expired' });
        return res.redirect('/login?error=Session is invalid or has expired');
    }
};



export const validateToken = async (req,res,next) => {
    try{
        const accessToken = req.headers.authorization?.split(' ')[1]

        const userId = await getAsync(`accessToken:${accessToken}`)

        if(userId){
            req.userId = userId
            return next()
        }

        const refreshToken = req.session.refreshToken

        if(!refreshToken){
            return res.redirect('/login?error=Session is invalid or expired')
        }

        const storedUserId = await getAsync(`refreshToken:${refreshToken}`)

        if(!storedUserId){
            return res.redirect('/login?error=Session is invalid or expired')
        }

        await delAsync(`accessToken:${accessToken}`)
        await delAsync(`refreshToken:${refreshToken}`)


        const newAccessToken = uuidv4()
        const newRefreshToken = uuidv4()

        await setAsync(`accessToken:${newAccessToken}`, storedUserId, 'EX', ACCESS_TOKEN_EXPIRY)
        await setAsync(`refreshToken:${newRefreshToken}`, storedUserId, 'EX', REFRESH_TOKEN_EXPIRY)

        res.cookie('accessToken', newAccessToken, { httpOnly : true})
        req.session.accessToken = newAccessToken,
        req.session.refreshToken = newRefreshToken

        req.userId = storedUserId
        next()
    }catch(err){
        console.log('error in token validation middleware',err.message)
    }
}