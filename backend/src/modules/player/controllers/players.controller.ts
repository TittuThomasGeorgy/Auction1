import mongoose, { ObjectId, Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { NextFunction, Request, Response } from "express";
import { uploadFiles } from "../../common/controllers/files.controller";
import { IFileModel } from "../../common/types/fileModel";
import Player from "../models/Player";
import { IPlayer } from "../types/player";


export const getPlayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if the searchKey matches any playerClass element with regex
        let searchKey = req.query.searchKey as string;

        const _data = await Player.find({
            ...(searchKey
                ? {
                    // $or: [
                    // {
                    name: {
                        $regex: searchKey,
                        $options: 'i',
                    },
                    // },
                    //     ...(classIndexes.length > 0
                    //         ? [{ playerClass: { $in: classIndexes } }] // Use $in operator to match any of the indexes
                    //         : []),
                    // ],
                }
                : {}),
        })
            .populate('image')
            .sort({ 'position': 1, 'name': 1 });

        // If your logo is being populated correctly, we need to handle it properly in the map function
        const data: IPlayer[] = await Promise.all(_data.map(async (player) => {
            const logoObj = (player.image as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed

            return {
                ...player.toObject(),  // Convert mongoose document to a plain object
                image: logoObj ?? '',  // Use the downloadURL if it exists
            };
        }));

        sendApiResponse(res, 'OK', data, 'Successfully fetched list of Players');
    } catch (error) {
        next(error);
    }
}
export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _data = await Player.findById((req.params.id))
            .populate([
                // {
                //     path: 'club',
                //     populate: {
                //         path: 'logo',
                //     },
                // },
                { path: 'image' },
            ])
            .sort({ 'name': 1 });
        if (!_data) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Player Not Found');
        }
        const logoObj = (_data.image as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        const data: IPlayer = {
            ..._data.toObject(),  // Convert mongoose document to a plain object
            image: logoObj ?? '',  // Use the downloadURL if it exists
        };
        // console.log(data);

        sendApiResponse(res, 'OK', data, 'Successfully fetched Player');
    } catch (error) {
        next(error);
    }
}


export const createPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }

        const _file = await uploadFiles(req.body.name, req.file, process.env.PLAYERS_FOLDER ?? '',);

        const newPlayer = new Player({ ...req.body, _id: new mongoose.Types.ObjectId() });
        if (_file) {
            newPlayer.image = _file._id;
        }
        newPlayer.save();
        if (!newPlayer) {
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Created');
        }
        sendApiResponse(res, 'CREATED', newPlayer,
            `Added Player successfully`);
    } catch (error) {
        next(error);
    }
}
export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedPlayer = req.body;
        const prevPlayer = await Player.findById(req.params.id).populate('image');
        if (!prevPlayer) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Player Not Found');
        }

        const prevPlayerLogo = (prevPlayer?.image as unknown as IFileModel);
        const isSameLogo = prevPlayerLogo.downloadURL === _updatedPlayer.image;
        let _file: IFileModel | null = null;
        if (!isSameLogo && req.file) {
            _file = (await uploadFiles(req.body.name, req.file, process.env.STUDENT_FOLDER ?? '', prevPlayerLogo.fileId));
            _updatedPlayer.image = _file?._id
        }
        else {
            _updatedPlayer.image = prevPlayer?.image
        }
        
        if (!req.body.club) _updatedPlayer.club = null;
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, _updatedPlayer);
        if (!updatedPlayer) {
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Updated');
        }
        sendApiResponse(res, 'OK', _updatedPlayer,
            `Player updated successfully`);
    } catch (error) {
        next(error);
    }
}
