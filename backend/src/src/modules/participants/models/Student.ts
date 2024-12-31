import { Schema, model } from 'mongoose';
import { IStudent } from '../types/student';

export const StudentSchema = new Schema<IStudent>({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  logo: { type: Schema.Types.ObjectId, ref: 'files' },
  school: { type: Schema.Types.ObjectId, ref: 'schools' },
  studentClass: { type: Number, enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], required: true },

}, {
  timestamps: true,
});
const Student = model<IStudent>('students', StudentSchema);

export default Student;
