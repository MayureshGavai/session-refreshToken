import bcrypt from 'bcryptjs'
import { newUserQuery, signinUserQuery } from '../model/user.model.js'
import { v4 as uuidv4 } from 'uuid'
import { getAsync, setAsync, delAsync } from '../config/redis.js'
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, SESSION_PREFIX, USER_SESSION_PREFIX } from '../utils/constants.js'


const invalidateExistingSession = async (userId) => {
    const existingSessionId = await getAsync(`${USER_SESSION_PREFIX}${userId}`)
    if(existingSessionId){

        // // Retrieve old tokens from session 
        // const oldAccessToken = await getAsync(`${SESSION_PREFIX}${existingSessionId}:accessToken`)
        // const oldRefreshToken = await getAsync(`${SESSION_PREFIX}${existingSessionId}:refreshToken`)

        // // Delete old tokens if exists 
        // if (oldAccessToken) await delAsync(`accessToken:${oldAccessToken}`)
        // if (oldRefreshToken) await delAsync(`refreshToken:${oldRefreshToken}`)

        await delAsync(`accessToken:${userId}`)
        await delAsync(`refreshToken:${userId}`)

        // Invalidate old session 
        await delAsync(`${SESSION_PREFIX}${existingSessionId}`)
    }
}

export const signupController = async (req,res) => {
    try{
        const {username, email, password} = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const user = {
            username : username,
            email : email,
            password : hashedPassword
        }
        await newUserQuery(user)
        return res.redirect('/login')
    }catch(err){
        console.log('error in signup controller :',err.message)
    }
}

export const signinController = async (req,res) => {
    try {
        const { username, password } = req.body;
        const user = { username, password };

        if (!user.username || !user.password) {
            return res.redirect('/login?error=Username and password are required');
        }

        const result = await signinUserQuery(user);

        await invalidateExistingSession(result.user.id);

        const accessToken = uuidv4();
        const refreshToken = uuidv4();

        req.session.userId = result.user.id;
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;

        await setAsync(`${USER_SESSION_PREFIX}${result.user.id}`, req.sessionID);
        await setAsync(`accessToken:${result.user.id}`, accessToken, 'EX', ACCESS_TOKEN_EXPIRY)
        await setAsync(`refreshToken:${result.user.id}`, refreshToken, 'EX', REFRESH_TOKEN_EXPIRY)

        res.cookie('accessToken', accessToken, {
            httpOnly: false,
            secure : false,
            sameSite : false,
            path : '/'
        })

        return res.redirect('/');

    } catch (err) {
        console.log(err.message);
        return res.redirect('/login?error=An internal error occurred');
    }
}


export const signoutController = async (req,res) => {
    try {
        if (req.session) {
            
            const userId = req.session.userId
            await delAsync(`accessToken:${userId}`)
            await delAsync(`refreshToken:${userId}`)

            // Destroy the session in Redis
            const sessionId = req.sessionID;
            await delAsync(`${SESSION_PREFIX}${sessionId}`);
            
            // Destroy the userSession in Redis 
            await delAsync(`${USER_SESSION_PREFIX}${userId}`)
            
            // Destroy the session in the Express app
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ error: 'Failed to destroy session' });
                }

                res.clearCookie('connect.sid')
                res.clearCookie('accessToken')
                res.redirect('/login')
            });
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Error during signout:', err);
        res.status(500).json({ error: 'An error occurred during signout' });
    }
}

