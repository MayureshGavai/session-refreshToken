import bcrypt from 'bcryptjs'
import { newUserQuery, signinUserQuery } from '../model/user.model.js'
import { v4 as uuidv4 } from 'uuid'

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
        const user = {
            username: username,
            password: password
        };

        if (!user.username || !user.password) {
            return res.redirect('/login?error=Username and password are required');
        }

        const result = await signinUserQuery(user);

        if (!result.success) {
            return res.redirect(`/login?error=${encodeURIComponent(result.message)}`);
        }
        // console.log(result.user)
        // Assuming you set the user in session after successful login
        
        const accessToken = uuidv4()
        const refreshToken = uuidv4()
        
        req.session.userId = result.user.id
        req.session.accessToken = accessToken
        req.session.refreshToken = refreshToken

        res.cookie('session_id', req.sessionID, {httpOnly : true})

        // Redirect to the index page after successful login
        return res.redirect('/');
    } catch (err) {
        console.log(err.message);
        return res.redirect('/login?error=An internal error occurred');
    }
}


export const signoutController = async (req,res) => {
    try{
        req.session.destroy((err) => {
            if(err){
                console.log(err.message)
                // return res.redirect('/?error=An internal error occurred')
            }
        })

        res.clearCookie('session_id')
        res.clearCookie('connect.sid', { path: '/' });

        return res.redirect('/login')
    }catch(err){
        console.log(err.message)
    }
}