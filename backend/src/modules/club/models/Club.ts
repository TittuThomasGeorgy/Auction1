import { Schema, model } from 'mongoose';
import { IClub } from '../types/club';

export const ClubSchema = new Schema<IClub>({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  logo: { type: Schema.Types.ObjectId, ref: 'files' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  manager: {
    name: { type: String, required: true },
    img: { type: Schema.Types.ObjectId, ref: 'files' },
  },
  balance: { type: Number, required: true },
}, {
  timestamps: true,
});
const Club = model<IClub>('clubs', ClubSchema);

export default Club;
