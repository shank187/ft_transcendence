import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
    res.status(200).send('ft_transcendence API is running!');
});

app.get('/api/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
        status: 'success',
        message: 'API and Database are online!'
        });
    } catch (error) {
        console.error('Database health check failed:', error);

        res.status(500).json({
        status: 'error',
        message: 'Database connection failed'
        });
    }
});

export default app;