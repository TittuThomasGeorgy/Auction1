import { Router } from "express";
import multer from "multer";
import { getPlayersReq, getPlayerById, createPlayer, updatePlayer, deletePlayer, getBids, removeClub, sellPlayer } from "../controllers/players.controller";

const playerRouter = Router();

// for uploading profile pic
const upload = multer({
  storage: multer.diskStorage({}),
});

playerRouter.get('/', getPlayersReq);
playerRouter.get('/:id', getPlayerById);
playerRouter.get('/:id/bid', getBids);
playerRouter.post('/', upload.single('file'), createPlayer);
playerRouter.patch('/:id', upload.single('file'), updatePlayer);
playerRouter.post('/:id/sell', sellPlayer);
playerRouter.delete('/:id', deletePlayer);
playerRouter.delete('/:id/club', removeClub);

export default playerRouter;
