import { Router } from "express";
import multer from "multer";
import { getPlayersReq, getPlayerById, createPlayer, updatePlayer } from "../controllers/players.controller";

const playerRouter = Router();

// for uploading profile pic
const upload = multer({
  storage: multer.diskStorage({}),
});

playerRouter.get('/', getPlayersReq);
playerRouter.get('/:id', getPlayerById);
playerRouter.post('/', upload.single('file'), createPlayer);
playerRouter.patch('/:id', upload.single('file'), updatePlayer);

export default playerRouter;
