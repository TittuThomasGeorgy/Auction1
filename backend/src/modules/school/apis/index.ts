import { Router } from "express";
import { createSchool, getSchoolByIdReq, getSchoolLogin, getSchools, loggedSchool, updateSchool } from "../controllers/school.controller";
import multer from "multer";
import { authCheck } from "../../common/controllers/authorization.controller";

const schoolRouter = Router();

// for uploading profile pic
const upload = multer({
  storage: multer.diskStorage({}),
});

schoolRouter.get('/', getSchools);
schoolRouter.get('/me', authCheck, loggedSchool);
schoolRouter.get('/:id', getSchoolByIdReq);
schoolRouter.post('/', upload.single('file'), createSchool);
schoolRouter.post('/login', getSchoolLogin);
schoolRouter.patch('/:id', upload.single('file'), updateSchool);

export default schoolRouter;
