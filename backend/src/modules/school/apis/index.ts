import { Router } from "express";
import { createTeam, getTeamByIdReq, getTeamLogin, getTeams, loggedTeam, updateTeam } from "../controllers/team.controller";
import multer from "multer";
import { authCheck } from "../../common/controllers/authorization.controller";

const teamRouter = Router();

// for uploading profile pic
const upload = multer({
  storage: multer.diskStorage({}),
});

teamRouter.get('/', getTeams);
teamRouter.get('/me', authCheck, loggedTeam);
teamRouter.get('/:id', getTeamByIdReq);
teamRouter.post('/',  upload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
  ]), createTeam);
teamRouter.post('/login', getTeamLogin);
teamRouter.patch('/:id',  upload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
  ]), updateTeam);

export default teamRouter;
