import { Router } from "express";
import { getSettings, resetSettings, updateSettings } from "../controllers/settings.controller";
const SettingsRouter = Router();

SettingsRouter.get('/', getSettings);
SettingsRouter.post('/reset', resetSettings);
SettingsRouter.patch('/:id', updateSettings);

export default SettingsRouter;
