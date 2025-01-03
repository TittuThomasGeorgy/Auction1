import { Schema, model } from 'mongoose';
import { ITeam } from '../types/team';

export const TeamSchema = new Schema<ITeam>({
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
  }
}, {
  timestamps: true,
});
const Team = model<ITeam>('teams', TeamSchema);

export default Team;
