import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import exerciseRouter from "./modules/exercises/exercise.route";
import workoutRouter from "./modules/workouts/workout.route"
import progressRouter from "./modules/progress/progress.route";



const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.use("/api/exercises", exerciseRouter)

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workout-plans', workoutRouter)

app.use("/api/progress", progressRouter);

export default app;