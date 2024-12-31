import { Schema, model } from 'mongoose';
import { ISchool } from '../types/school';

export const SchoolSchema = new Schema<ISchool>({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  address: { type: String, required: true },
  logo: { type: Schema.Types.ObjectId, ref: 'files' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, {
  timestamps: true,
});
const School = model<ISchool>('schools', SchoolSchema);

export default School;
