import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import exerciseRouter from "./modules/exercises/exercise.route";
import friendsRoutes from "./modules/friends/friends.routes"

dotenv.config();

const app = express();


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.use("/api/exercises", exerciseRouter)

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/friends', friendsRoutes)

export default app;