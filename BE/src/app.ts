import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes';
import universitasRoutes from './routes/universitas.routes';
import sekolahRoutes from './routes/sekolah.routes';
import usersRoutes from './routes/users.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/universitas', universitasRoutes);
app.use('/api/sekolah', sekolahRoutes);
app.use('/api/users', usersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
