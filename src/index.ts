import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { router } from './routes';
import 'reflect-metadata';

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
