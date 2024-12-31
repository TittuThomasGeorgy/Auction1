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
import Google from './extras/google';
import Events from './modules/events/models/Events';

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

console.log('Trying to conenct to mongodb'.yellow);
mongoose.connect('mongodb://127.0.0.1:27017/youthFest')
    .then(async () => {
        console.log('Connected to mongodb'.bgGreen);
        await Events.updateMany({}, { type: 'IND' })
    })
    .catch((error) => console.log('Received an error event!'.bgRed, error));

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`.bgGreen))
    .on('error', (error) => console.log('Received an error event!'.bgRed, error));

Google.Drive.initialize(Google.Auth.getAuth()); // GoogleMail
