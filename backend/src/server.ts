import colors from 'colors';
colors.enable();
import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import router from './modules/router';
import { sendStandardResponse } from './common/extras/helpers';
import Google from './extras/google';
import { createSettings, isSettingExist } from './modules/settings/controllers/settings.controller';
import { Server } from 'socket.io';
import { auctionEvents } from './modules/auction/apis';
import { createAuction } from './modules/auction/controllers/auction.controller';
import path from 'path';

dotenv.config();

// ---- PORT CONFIGURATION ----
const REST_PORT = process.env.PORT;
const SOCKET_PORT = process.env.SOCKET_PORT;

if (!REST_PORT || !SOCKET_PORT) {
    throw new Error('PORT or SOCKET_PORT not found in environment variables!');
}

// ---- EXPRESS APP FOR REST API ----
const app = express();
const restServer = http.createServer(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(router);

// Error handlers
app.use((error: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.info('Caught error by the error handler!');
    sendStandardResponse(res, 'INTERNAL SERVER ERROR', {
        error: error.message,
        message: 'Oops! Something went wrong! We\'re working on it!',
    });
});

app.use((req: Request, res: Response) => {
    console.log('Received an error event!'.bgRed, new Error(`404 Found for ${req.url}`));
    sendStandardResponse(res, 'NOT FOUND', {
        error: '404 Not Found (REST API Endpoint not implemented)',
        message: 'Oops! Something went wrong! We\'re working on it!',
    });
});


// ---- MONGODB CONNECTION ----
console.log('Trying to connect to mongodb'.yellow);
mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/auction')
    .then(async () => {
        console.log('Connected to mongodb'.bgGreen);
        await createSettings();
        await createAuction();
    })
    .catch((error) => console.log('Received an error event!'.bgRed, error));


// ---- START REST API SERVER ----
restServer.listen(REST_PORT, () => console.log(`REST Server running: http://localhost:${REST_PORT}`.bgGreen))
    .on('error', (error) => console.log('Received an error event!'.bgRed, error));


// ---- WEBSOCKET SERVER ----
const wsServer = new http.Server(app);
const io = new Server(wsServer, {
    cors: { origin: '*' },
});

let client: { id: string, no: number }[] = [];
io.on('connection', (socket) => {
    if (!client.find(client => client.id === socket.id)) {
        client = [...client, { id: socket.id, no: client.length + 1 }]
    }
    console.log('Active connections:', io.engine.clientsCount);
    console.log('New client connected:', client);
    auctionEvents();
    socket.on('disconnect', () => {
        client = client.filter(c => c.id !== socket.id);
        console.log('Client disconnected:', socket.id);
    });
});

// Start the WebSocket server
wsServer.listen(SOCKET_PORT, () => {
    console.log(`Socket Server running on http://localhost:${SOCKET_PORT}`.bgGreen);
});

// ---- GOOGLE DRIVE INTEGRATION ----
Google.Drive.initialize(Google.Auth.getAuth());

// ---- EXPORT FOR OTHER MODULES ----
export { io };