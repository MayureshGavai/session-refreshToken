import express from 'express'
import { configDotenv } from 'dotenv'
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './src/routes/users.route.js'
import redis from 'redis'
import connectRedis from 'connect-redis'
import session from 'express-session';

configDotenv()

const app = express()
// app.use(morgan('dev'));
const RedisStore = new connectRedis(session)
const client = redis.createClient({ legacyMode: true })

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

// Connect to Redis
await client.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static('./public'))

app.use(
    session({
      store: new RedisStore({ client: client }),
      secret: 'secret-key',
      resave: false,
      saveUninitialized: false, // Avoid creating sessions for unauthenticated users
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 2000 * 24 * 60 * 60, // Adjust as needed
      },
    })
);


const PORT = process.env.PORT || 3000

app.use(userRoutes)

app.get('/login', (req, res) => {
    const error = req.query.error || '';
    res.render('login', { error });
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/', (req, res) => {
    res.render('index')
})


app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})