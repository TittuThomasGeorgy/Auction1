import colors from 'colors';
colors.enable();
import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import router from './modules/router';
import { sendStandardResponse } from './common/extras/helpers';
import WebSocket from 'ws';
import Google from './extras/google';
import { createSettings, isSettingExist } from './modules/settings/controllers/settings.controller';
import Club from './modules/club/models/Club';
import { Server } from 'socket.io';
import { auctionEvents } from './modules/auction/apis';
import { createAuction } from './modules/auction/controllers/auction.controller';
import Bid from './modules/auction/models/Bid';

dotenv.config();

const PORT = process.env.PORT;
if (!PORT) {
    throw new Error('PORT not found in environment variables!');
}

const app = express();
const server = http.createServer(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(router);


app.use((error: Error, req: Request, res: Response) => {
    console.info('Caught error by the error handler!!!');
    // log the error
    sendStandardResponse(res, 'INTERNAL SERVER ERROR', {
        error: error.message, message: 'Oops! Something went wrong! We\'re working on it!',
    });
});

app.use((req: Request, res: Response) => {
    console.log('Received an error event!'.bgRed, new Error(`404 Found for ${req.url}`));
    sendStandardResponse(res, 'NOT FOUND', {
        error: '404 Not Found (REST API Endpoint not implemented)',
        message: 'Oops! Something went wrong! We\'re working on it!',
    });
});

console.log('Trying to connect to mongodb'.yellow);
mongoose.connect(process.env.MONGO_URI??'mongodb://127.0.0.1:27017/auction')
    .then(async () => {
        console.log('Connected to mongodb'.bgGreen);
        await createSettings();
        await createAuction();
        // await Bid.updateMany({}, { state: 1 })
    })
    .catch((error) => console.log('Received an error event!'.bgRed, error));

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`.bgGreen))
    .on('error', (error) => console.log('Received an error event!'.bgRed, error));

Google.Drive.initialize(Google.Auth.getAuth()); // GoogleMail

const io = new Server(server, {
    cors: { origin: '*' }, // Allow frontend to connect
});

let client: { id: string, no: number }[] = [];
// Attach event listeners for the connection
io.on('connection', (socket) => {
    if (!client.find(client => client.id === socket.id)) {
        client = [...client, { id: socket.id, no: client.length + 1 }]
    }
    // io.disconnectSockets(true)
    console.log('Active connections:', io.engine.clientsCount);
    console.log('New client connected:', client);
    auctionEvents();
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});


// Start the server

server.listen(process.env.SOCKET_PORT, () => {
    console.log(`Socket Server running on http://localhost:${process.env.SOCKET_PORT}`);
});

// Export io for use in other files
export { io };

