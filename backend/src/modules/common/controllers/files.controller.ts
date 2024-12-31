import fs from 'fs';
import GoogleDrive from '../../../extras/google/GoogleDrive';
import multer from 'multer';
import { FileModel } from '../models/FileModel';
import { IFileModel } from '../types/fileModel';
import mongoose from 'mongoose';

export const uploadFiles = async (filename: string, file: Express.Multer.File, filePath: string, existingFileId?: string | null): Promise<IFileModel | null> => {
    try {
        const fileID = await GoogleDrive.uploadFile({
            name: filename,
            body: fs.createReadStream(file.path),
            mimeType: file.mimetype,
            makePublic: true,
            parents: [filePath],
        }).catch(err => console.log(err));
        if (!fileID) return null;
        const _file = new FileModel({
            _id: new mongoose.Types.ObjectId(),
            filename: filename,
            type: file?.mimetype,
            size: file?.size,
            fileId: fileID,
            downloadURL: `https://drive.google.com/${file?.mimetype == 'image/png' ||
                file?.mimetype == 'image/jpeg' || file?.mimetype == 'image/jpg' ? 'thumbnail' : 'uc'}?id=${fileID}&export=download`,
        });
        await _file.save();
        if (existingFileId) {

            GoogleDrive.deleteFile(existingFileId)
                .then(() =>
                    console.log('deleted user image from Google Drive'.bgYellow)
                ).catch((error) => {
                    console.log(error, 'dltFile');
                });
        }
        console.log('Uploaded user image to Google Drive'.bgYellow);
        return _file;
    }
    catch (error) {
        console.log(error);
        return (null);
    }
}
