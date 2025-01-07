import sendApiResponse from "../common/extras/sendApiResponse";
import { Router, Request, Response, NextFunction } from 'express';
import clubRouter from "./club/apis";
import playerRouter from "./player/apis";
import settingsRouter from "./settings/apis";



const router = Router();

router.use('/club', clubRouter);
router.use('/player', playerRouter);
router.use('/settings', settingsRouter);

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.info('Caught error by the error handler!!!');
    if (error.message === 'SchoolNotFound') {
        sendApiResponse(res, 'NOT FOUND', null, 'School Not Found');
    } else if (error.message === 'Unauthorized') {
        sendApiResponse(res, 'UNAUTHORIZED', null, 'Unauthorized User');
    } else {

        // log the error
        //   commonEvents.emit('error', error);
        sendApiResponse(res, 'INTERNAL SERVER ERROR', {
            success: false,
            error: error.message,
            message: "Oops! Something went wrong! We're working on it!",
        });
    }
});

router.use((req: Request, res: Response) => {
    //   commonEvents.emit('error', new Error(`404 Found for ${req.url}`));
    sendApiResponse(res, 'NOT FOUND', {
        error: '404 Not Found (REST API Endpoint not implemented)',
        message: "Oops! Something went wrong! We're working on it!",
        success: false,
    });
});

export default router;
