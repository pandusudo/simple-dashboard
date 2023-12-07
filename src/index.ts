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
      user?: Partial<User>;
      session?: Partial<Session>;
    }
  }
}

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(router);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
