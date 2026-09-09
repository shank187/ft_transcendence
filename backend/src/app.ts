import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import exerciseRouter from "./modules/exercises/exercise.route";

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.use("/api/exercises", exerciseRouter)

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// app.get('/api/health', async (_req, res) => {
//     try {
//         await prisma.$queryRaw`SELECT 1`;
//         res.status(200).json({ status: 'success', message: 'API and Database are online!' });
//     } catch (error) {
//         res.status(500).json({ status: 'error', message: 'Database connection failed' });
//     }
// });

export default app;