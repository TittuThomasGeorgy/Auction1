import sendApiResponse from "../common/extras/sendApiResponse";
import { Router, Request, Response, NextFunction } from 'express';
import clubRouter from "./club/apis";
import playerRouter from "./player/apis";
import settingsRouter from "./settings/apis";
import { auctionRouter } from "./auction/apis";



const router = Router();

router.use('/club', clubRouter);
router.use('/player', playerRouter);
router.use('/settings', settingsRouter);
router.use('/auction', auctionRouter);

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.info('Caught error by the error handler!!!');
    if (error.message === 'Unauthorized') {
        return sendApiResponse(res, 'UNAUTHORIZED', null, 'Unauthorized User');
    } else {

        // log the error
        //   commonEvents.emit('error', error);
        return sendApiResponse(res, 'INTERNAL SERVER ERROR', {
        },
            error.message
        );
    }
});

router.use((req: Request, res: Response) => {
    console.log('fi');

    //   commonEvents.emit('error', new Error(`404 Found for ${req.url}`));
    sendApiResponse(res, 'NOT FOUND', {
        error: '404 Not Found (REST API Endpoint not implemented)',
    },
        "Oops! Something went wrong! We're working on it!",
    );
});

export default router;
