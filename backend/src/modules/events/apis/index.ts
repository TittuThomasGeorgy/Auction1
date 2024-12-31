import { Router } from "express";
import multer from "multer";
import { createEvent, editResult, getEventById, getEvents, getParticipatedEvents, participateEvent, updateEvent } from "../controllers/events.controller";

const eventRouter = Router();

// for uploading profile pic
const upload = multer({
  storage: multer.diskStorage({}),
});

eventRouter.get('/', getEvents);
eventRouter.get('/participate', getParticipatedEvents);
eventRouter.get('/:id', getEventById);
eventRouter.post('/', upload.single('file'), createEvent);
eventRouter.post('/participate', participateEvent);
eventRouter.patch('/participate', editResult);
eventRouter.patch('/:id', upload.single('file'), updateEvent);

export default eventRouter;
