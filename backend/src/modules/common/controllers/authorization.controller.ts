import mongoose from "mongoose";
import { getClubById } from "../../club/controllers/club.controller";
import { IClub } from "../../club/types/club";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { Types } from "mongoose";

export const authCheck = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return sendApiResponse(res, 'UNAUTHORIZED', null,
                `Please Login`);
        }
        const _id = authHeader;
        const data: IClub = await getClubById(_id);
        if (!data) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `No User Found`);
        }
        res.locals.club = data;
        next();
    } catch (error) {
        console.log({ error });
        return sendApiResponse(res, 'NOT FOUND', null,
            `No User Found`);
    }

}
