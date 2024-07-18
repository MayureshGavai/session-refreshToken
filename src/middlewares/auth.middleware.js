import { createNewTokens, deleteOldTokens, getStoredTokens } from "../utils/token.util.js";


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

        if(!accessToken){
            return res.redirect('/login?error=Session is invalid or expired')
        }

        const userId = req.session.userId
        const {accessToken : storedAccessToken, refreshToken : storedRefreshToken} = await getStoredTokens(userId)

        if(storedAccessToken === accessToken){
            return next()
        }

        if (storedRefreshToken) {
            // Refresh token is valid, generate new tokens
            await deleteOldTokens(userId)

            const {newAccessToken, newRefreshToken} = await createNewTokens(userId)
            res.cookie('accessToken', newAccessToken, {
                httpOnly: false,
                secure : false,
                sameSite : false,
                path : '/'
            })
            req.session.accessToken = newAccessToken;
            req.session.refreshToken = newRefreshToken;

            return next();    
        }
        // Both tokens are invalid or expired, redirect to login
        return res.redirect('/login');
    }catch(err){
        console.log('error in token validation middleware',err.message)
    }
}