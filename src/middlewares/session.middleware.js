import { getAsync } from "../config/redis.js";
import { USER_SESSION_PREFIX } from "../utils/constants.js";


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
