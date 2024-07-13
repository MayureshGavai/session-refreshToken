import { sql, poolConnect } from "../config/db.js";
import bcrypt from 'bcryptjs'

export const newUserQuery = async (user) => {
    try{
        const pool = await poolConnect
        const checkUserResult = await pool.request()
            .input('email', sql.NVarChar, user.email)
            .query(`SELECT COUNT(*) AS count FROM Users WHERE email = @email`)

        if(checkUserResult.recordset[0].count > 0){
            throw new Error('User already registered')
        }

        const result = await pool.request()
            .input('username',sql.NVarChar,user.username)
            .input('email',sql.NVarChar,user.email)
            .input('password',sql.NVarChar,user.password)
            .query(`INSERT INTO Users (username, email, password) VALUES (@username, @email, @password)`)
        
        if (result && result.rowsAffected && result.rowsAffected.length > 0) {
            return result.rowsAffected[0];
        } else {
            throw new Error('Unexpected result format');
         }
    }catch(err){
        console.log('error in newUserQuery model :',err.message)
    }
}

export const signinUserQuery = async (user) => {
    try {
        const pool = await poolConnect;
        const result = await pool.request()
            .input('username', sql.NVarChar, user.username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (result.recordset.length === 0) {
            return { success: false, message: 'User not found' };
        }

        const savedUser = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(user.password, savedUser.password);

        if (!isPasswordValid) {
            return { success: false, message: 'Invalid Password' };
        }

        return { success: true, user: savedUser };
    } catch (err) {
        console.log('error in signinQuery model:', err.message);
        return { success: false, message: 'An error occurred' };
    }
}