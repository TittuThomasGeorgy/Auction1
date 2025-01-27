import { Schema, model } from 'mongoose';
import { ISettings } from '../types/setting';

export const SettingsSchema = new Schema<ISettings>({
  _id: { type: Schema.Types.ObjectId, required: true },
  initialBalance: { type: Number, required: true, default: 0 },
  playersPerClub: { type: Number, required: true, default: 0 },
  bidTime: { type: Number, required: true, unique: true, default: 0 },
  resetPassword: { type: String, required: true },
}, {
  timestamps: true,
});
const Settings = model<ISettings>('settings', SettingsSchema);

export default Settings;
