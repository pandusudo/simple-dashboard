import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { router } from './routes';
import 'reflect-metadata';
import { User } from './custom-types/user';
import { Session } from './custom-types/session';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<User> & { password_is_set: boolean };
      session?: Partial<Session>;
    }
  }
}

const app = express();
const PORT = process.env.PORT;

const options: cors.CorsOptions = {
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: process.env.FE_PATH || 'http://localhost:3000',
  preflightContinue: true,
};

app.set('trust proxy', 1);
app.use(cookieParser());
app.use(cors(options));

app.use(bodyParser.json());
app.use(router);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
