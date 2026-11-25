import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import exerciseRouter from "./modules/exercises/exercise.route";
import equipmentRouter from "./modules/equipment/equipment.route";
import workoutRouter from "./modules/workouts/workout.route"
import workoutSessionRouter from "./modules/workout-sessions/workout-session.route";
import progressRouter from "./modules/progress/progress.route";
import friendsRoutes from "./modules/friends/friends.routes";
import conversationsRoutes from "./modules/chat/chat.router";
import gymsRoutes from "./modules/gyms/gym.routes"


const app = express();


app.use("/uploads/avatars", express.static("uploads/avatars"));
app.use("/uploads/gyms", express.static("uploads/gyms"));

app.use(express.json());
app.use(cookieParser());


app.use("/api/exercises", exerciseRouter)
app.use("/api/equipment", equipmentRouter)
app.use('/api/workout-plans', workoutRouter)
app.use('/api/workout-sessions', workoutSessionRouter)

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use("/api/progress", progressRouter);

app.use('/api/friends', friendsRoutes);
app.use('/api/conversations', conversationsRoutes);


app.use('/api/gyms', gymsRoutes);

// unknown api routes
app.use('/api', (_req: Request, res: Response) => {
    return res.status(404).json({message: 'API route not found.'});
});

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent)
        return next(error);

    if (error instanceof Error && 'type' in error)
    {
        if (error.type === 'entity.parse.failed')
            return res.status(400).json({message: 'Invalid JSON request body.'});

        if (error.type === 'entity.too.large')
            return res.status(413).json({message: 'Request body is too large.'});
    }

    return res.status(500).json({message: 'Internal server error.'});
});


export default app;
