import {Schema, model} from 'mongoose';
import { IFileModel } from '../types/fileModel';


const FileSchema = new Schema<IFileModel>({
  _id: Schema.Types.ObjectId,
  filename: {type: String, required: false},
  size: {type: Number, required: true},
  type: {
    type: String,
    enum: [
      'image/png',
      'image/jpeg',
      'image/jpg',
    ],
  },
  fileId: {type: String, required: false},
  downloadURL: {type: String, required: false},
}, {timestamps: true});

export const FileModel = model<IFileModel>('files', FileSchema);
