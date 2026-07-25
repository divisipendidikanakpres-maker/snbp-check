import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes';
import universitasRoutes from './routes/universitas.routes';
import sekolahRoutes from './routes/sekolah.routes';
import usersRoutes from './routes/users.routes';
import prodiRoutes from './routes/prodi.routes';
import lookupRoutes from './routes/lookup.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'https://snbp-check.vercel.app',
  'http://localhost:3000'
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/universitas', universitasRoutes);
app.use('/api/sekolah', sekolahRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/prodi', prodiRoutes);
app.use('/api/lookup', lookupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
