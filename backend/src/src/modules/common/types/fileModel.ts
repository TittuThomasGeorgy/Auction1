import { Types } from "mongoose";

export interface IFileModel {
  filename: string;
  size: number;
  type: FileObjectType;
  fileId: string;
  downloadURL: string | null;
  _id: Types.ObjectId;
}
type FileObjectType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/jpg'