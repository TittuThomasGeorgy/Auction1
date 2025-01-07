import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller";
const SettingsRouter = Router();

SettingsRouter.get('/', getSettings);
SettingsRouter.patch('/:id', updateSettings);

export default SettingsRouter;
