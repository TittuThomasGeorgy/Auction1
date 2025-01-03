import mongoose, { ObjectId, Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { NextFunction, Request, Response } from "express";
import { uploadFiles } from "../../common/controllers/files.controller";
import { IFileModel } from "../../common/types/fileModel";
import { ITeam } from "../types/team";
import Events from "../../events/models/Events";
import Team from "../models/Team";

export const getTeams = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchKey = req.query.searchKey;
        const _data = await Team.find({
            ...(searchKey
                ? {
                    $or: [
                        {
                            name: {
                                $regex: searchKey as string,
                                $options: 'i',
                            },
                        },
                        {
                            address: {
                                $regex: searchKey as string,
                            },
                        },
                        {
                            code: {
                                $regex: searchKey as string,
                            },
                        },
                    ],
                }
                : {})
        })
            .populate('logo')
            .sort({ 'name': 1 });
        const schoolScore = await calculateTeamScores();
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const data: ITeam[] = _data.map((scl) => {
            const logoObj = (scl.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
            delete scl.password;

            return {
                ...scl.toObject(),  // Convert mongoose document to a plain object
                logo: logoObj ?? '',  // Use the downloadURL if it exists
                score: schoolScore.find(sclScr => sclScr._id.equals(scl._id))?.totalPoints ?? 0
            };
        });

        sendApiResponse(res, 'OK', data, 'Successfully fetched list of Teams');
    } catch (error) {
        next(error);
    }
}
// Updated controller function
export const getTeamByIdReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: ITeam = await getTeamById(req.params.id);
        sendApiResponse(res, 'OK', data, 'Successfully fetched Team');
    } catch (error) {
        if ((error as any).message === 'TeamNotFound') {
            sendApiResponse(res, 'NOT FOUND', null, 'Team Not Found');
        } else {
            next(error); // Pass the error to the error-handling middleware for unexpected errors
        }
    }
};

// Service function to fetch the school data
export const getTeamById = async (id: string | Types.ObjectId): Promise<ITeam> => {
    const _data = await Team.findById(id)
        .populate('logo')
        .sort({ 'name': 1 });

    if (!_data) {
        throw new Error('TeamNotFound'); // Throw an error if the school is not found
    }

    const logoObj = (_data.logo as unknown as IFileModel).downloadURL;
    const schoolScore = await calculateTeamScores();

    const data: ITeam = {
        ..._data.toObject(),
        logo: logoObj ?? '',
        score: schoolScore.find(sclScr => sclScr._id.equals(id))?.totalPoints ?? 0
    };

    delete data.password;
    return data; // Return the data to the controller function
};
const userNameExist = async (username: string) => {
    const school = await Team.find({ username: username });
    return school;
}
export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const file1 = files?.file1?.[0];
        const file2 = files?.file2?.[0];
        if (!file1 || !file2) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }
        const isUserNameExist = await userNameExist(req.body.username);
        if (isUserNameExist.length > 0)
            return sendApiResponse(res, 'CONFLICT', null,
                `Username Already Exist`);
        const _file1 = await uploadFiles(req.body.name, file1, process.env.TEAM_FOLDER ?? '',);
        const _file2 = await uploadFiles(req.body.manager.name, file2, process.env.MANAGER_FOLDER ?? '',);
        const newTeam = new Team({ ...req.body, _id: new mongoose.Types.ObjectId() });
        if (_file1&&_file2) {
            newTeam.logo = _file1._id;
            newTeam.manager.img = _file2._id;
        }
        else {
            return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
                `File upload Failed`);
        }
        newTeam.save();
        if (!newTeam) {
            return sendApiResponse(res, 'CONFLICT', null, 'Team Not Created');
        }
        sendApiResponse(res, 'CREATED', newTeam,
            `Added Team successfully`);
    } catch (error) {
        next(error);
    }
}
export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedTeam = req.body;
        const prevTeam = await Team.findById(req.params.id).populate('logo');
        if (!prevTeam) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Team Not Found');
        }

        const prevTeamLogo = (prevTeam?.logo as unknown as IFileModel);
        const isSameLogo = prevTeamLogo.downloadURL === _updatedTeam.logo;
        let _file: IFileModel | null = null;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const file1 = files?.file1?.[0];
        const file2 = files?.file2?.[0];
        if (!file1 || !file2) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }
        if (!isSameLogo && file1) {
            _file = (await uploadFiles(req.body.name, file1, process.env.TEAM_FOLDER ?? '', prevTeamLogo.fileId));
            _updatedTeam.logo = _file?._id
        }
        else {
            _updatedTeam.logo = prevTeam?.logo
        }

        const updatedTeam = await Team.findByIdAndUpdate(req.params.id, { ...req.body, });
        if (!updatedTeam) {
            return sendApiResponse(res, 'CONFLICT', null, 'Team Not Updated');
        }
        sendApiResponse(res, 'OK', updatedTeam,
            `Team updated successfully`);
    } catch (error) {
        next(error);
    }
}

// Define the type for the score result
interface TeamScore {
    _id: Types.ObjectId;       // Team ID
    totalPoints: number;       // Total points earned by the school
}
export const calculateTeamScores: () => Promise<TeamScore[]> = async () => {
    const events = await Events.aggregate([
        // Lookup students for first, second, and third place in all events
        {
            $lookup: {
                from: 'students',
                localField: 'result.first',
                foreignField: '_id',
                as: 'firstPlaceStudents',
            },
        },
        {
            $lookup: {
                from: 'students',
                localField: 'result.second',
                foreignField: '_id',
                as: 'secondPlaceStudents',
            },
        },
        {
            $lookup: {
                from: 'students',
                localField: 'result.third',
                foreignField: '_id',
                as: 'thirdPlaceStudents',
            },
        },

        // Project school IDs for each placement
        {
            $project: {
                firstTeamIds: { $map: { input: "$firstPlaceStudents", as: "student", in: "$$student.school" } },
                secondTeamIds: { $map: { input: "$secondPlaceStudents", as: "student", in: "$$student.school" } },
                thirdTeamIds: { $map: { input: "$thirdPlaceStudents", as: "student", in: "$$student.school" } },
            },
        },
    ]);

    // Prepare to assign scores to schools
    const schoolScores: Record<string, number> = {};

    // Iterate through all events and calculate scores
    events.forEach(event => {
        // Add 5 points for each school in the first place
        event.firstTeamIds.forEach((schoolId: Types.ObjectId) => {
            schoolScores[schoolId.toString()] = (schoolScores[schoolId.toString()] || 0) + 5;
        });

        // Add 3 points for each school in the second place
        event.secondTeamIds.forEach((schoolId: Types.ObjectId) => {
            schoolScores[schoolId.toString()] = (schoolScores[schoolId.toString()] || 0) + 3;
        });

        // Add 1 point for each school in the third place
        event.thirdTeamIds.forEach((schoolId: Types.ObjectId) => {
            schoolScores[schoolId.toString()] = (schoolScores[schoolId.toString()] || 0) + 1;
        });
    });

    // Convert the results to an array of { schoolId, totalPoints }
    const result = Object.entries(schoolScores).map(([schoolId, score]) => ({
        _id: new Types.ObjectId(schoolId),
        totalPoints: score,
    }));

    // Optionally, sort by total score in descending order
    result.sort((a, b) => b.totalPoints - a.totalPoints);

    return result;
}

export const getTeamLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    console.log({ username, password }, req.body);
    try {
        const _data = await Team.findOne({ username: username, password: password })
            .populate('logo')
            .sort({ 'name': 1 });
        if (!_data) {
            return sendApiResponse(res, 'UNAUTHORIZED', null, 'Invalid Username or Password');
        }
        const logoObj = (_data.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const schoolScore = await calculateTeamScores();

        const data: ITeam = {
            ..._data.toObject(),  // Convert mongoose document to a plain object
            logo: logoObj ?? '', // Use the downloadURL if it exists
            score: schoolScore.find(sclScr => sclScr._id.equals(req.params.id))?.totalPoints ?? 0

        };
        delete data.password;
        sendApiResponse(res, 'OK', data, 'Successfully fetched Team');
    } catch (error) {
        next(error);
    }
}

export const loggedTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('hle');

        const data: ITeam = res.locals.school;
        sendApiResponse(res, 'OK', data, 'Successfully fetched Team');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};