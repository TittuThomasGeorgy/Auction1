import { Router } from "express";
import { createClub, getClubByIdReq, getClubLogin, getClubs, loggedClub, updateClub } from "../controllers/club.controller";
import multer from "multer";
import { authCheck } from "../../common/controllers/authorization.controller";

const ClubRouter = Router();

// for uploading profile pic
const upload = multer({
  storage: multer.diskStorage({}),
});

ClubRouter.get('/', getClubs);
ClubRouter.get('/me', authCheck, loggedClub);
ClubRouter.get('/:id', getClubByIdReq);
ClubRouter.post('/',  upload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
  ]), createClub);
ClubRouter.post('/login', getClubLogin);
ClubRouter.patch('/:id',  upload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
  ]), updateClub);

export default ClubRouter;
