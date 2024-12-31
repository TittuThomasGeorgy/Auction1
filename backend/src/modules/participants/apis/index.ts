import { Router } from "express";
import { createStudent, getStudentById, getStudents, updateStudent } from "../controllers/students.controller";
import multer from "multer";

const participantRouter = Router();

// for uploading profile pic
const upload = multer({
  storage: multer.diskStorage({}),
});

participantRouter.get('/', getStudents);
participantRouter.get('/:id', getStudentById);
participantRouter.post('/', upload.single('file'), createStudent);
participantRouter.patch('/:id', upload.single('file'), updateStudent);

export default participantRouter;
