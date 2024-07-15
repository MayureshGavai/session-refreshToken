import express from 'express';
import { configDotenv } from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './src/routes/users.route.js';
import dataRoutes from './src/routes/data.route.js';
import { redisClient } from './src/config/redis.js'; // Import the shared Redis client
import session from 'express-session';
import connectRedis from 'connect-redis';

configDotenv();

const app = express();
const RedisStore = connectRedis(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static('./public'));

app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: false, // Avoid creating sessions for unauthenticated users
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 2000 * 24 * 60 * 60, // Adjust as needed
        },
    })
);

const PORT = process.env.PORT || 3000;

app.use(userRoutes);
app.use(dataRoutes);

app.get('/login', (req, res) => {
    const error = req.query.error || '';
    res.render('login', { error });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
