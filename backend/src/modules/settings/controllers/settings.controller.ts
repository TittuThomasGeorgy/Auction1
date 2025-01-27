import mongoose, { ObjectId, Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { NextFunction, Request, Response } from "express";
import Settings from "../models/Settings";
import Player from "../../player/models/Player";
import Club from "../../club/models/Club";

export const isSettingExist = async () => {
    const data = await Settings.findOne({});
    return data
}
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = await isSettingExist();
        // If your logo is being populated correctly, we need to handle it properly in the map function
        delete data?.resetPassword;
        sendApiResponse(res, 'OK', data, 'Successfully fetched Settings');
    } catch (error) {
        next(error);
    }
}

export const createSettings = async () => {
    try {

        const settings = await isSettingExist();
        if (settings) {
            // console.log('Settings Exists'.bgGreen.black);
            return;
        }
        const newSettings = new Settings({
            _id: new mongoose.Types.ObjectId(),
            initialBalance: 0,
            playersPerClub: 6,
            bidTime: 10,
            resetPassword: 'qazwsx',
        });

        newSettings.save();
        console.log('Settings Created'.bgGreen.black);

        return;
    } catch (error) {
        console.log(error);
    }
}
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedSettings = req.body;
        const prevSettings = await isSettingExist();
        if (!prevSettings) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Settings Not Found');
        }

        const updatedSettings = await Settings.findByIdAndUpdate(req.params.id, _updatedSettings);
        if (!updatedSettings) {
            return sendApiResponse(res, 'CONFLICT', null, 'Settings Not Updated');
        }

        sendApiResponse(res, 'OK', _updatedSettings,
            `Settings updated successfully`);
    } catch (error) {
        next(error);
    }
}
export const resetSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const prevSettings = await isSettingExist();
        if (!prevSettings) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Settings Not Found');
        }

        if (prevSettings.resetPassword !== req.body.password)
            return sendApiResponse(res, 'CONFLICT', null, 'Password not matching');
        await Player.updateMany({}, { bid: null, club: null });
        await Club.updateMany({}, { balance: prevSettings.initialBalance });
        sendApiResponse(res, 'OK', prevSettings,
            `Reset successfully`);
    } catch (error) {
        next(error);
    }
}

