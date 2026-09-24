import express from 'express';
import { Request, Response} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import exerciseRouter from "./modules/exercises/exercise.route";
import path from "node:path";

dotenv.config();

const app = express();


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads",
    express.static(
        path.join(
            process.cwd(),
            "uploads",
        ),
    ),
);

app.use("/api/exercises", exerciseRouter)

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);



app.get('/users' , (req :Request , res : Response)=> {

    
    res.json({
        messg : "hello",
    });


} );



export default app;