import mongoose from "mongoose";
import { getSchoolById } from "../../school/controllers/team.controller";
import { ITeam } from "../../school/types/team";
import sendApiResponse from "../../../common/extras/sendApiResponse";

export const authCheck = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return sendApiResponse(res, 'UNAUTHORIZED', null,
                `Please Login`);
        }
        const _id = new mongoose.Types.ObjectId(authHeader?.slice(1, -1));
            const data: ITeam = await getSchoolById(_id);
        if (!data) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `No User Found`);
        }
        res.locals.school = data;
        next();
    } catch (error) {
        console.log({ error });
        return sendApiResponse(res, 'NOT FOUND', null,
            `No User Found`);
    }

}
