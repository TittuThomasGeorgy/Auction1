import mongoose, { ObjectId, Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { NextFunction, Request, Response } from "express";
import { uploadFiles } from "../../common/controllers/files.controller";
import { IFileModel } from "../../common/types/fileModel";
import { IClub } from "../types/club";
import Events from "../../events/models/Events";
import club from "../models/club";

export const getClubs = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const searchKey = req.query.searchKey;
        const _data = await club.find({
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
                            code: {
                                $regex: searchKey as string,
                            },
                        },
                    ],
                }
                : {})
        })
            .populate('logo')
            .populate('manager.img')
            .sort({ 'name': 1 });
        const schoolScore = await calculateClubScores();
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const data: IClub[] = _data.map((club) => {
            const logoObj = (club.logo as unknown as IFileModel).downloadURL; // Ensure that club.logo is properly typed
            const logoObj2 = (club.manager.img as unknown as IFileModel).downloadURL; // Ensure that club.logo is properly typed
            delete club.password;

            return {
                ...club.toObject(),  // Convert mongoose document to a plain object
                logo: logoObj ?? '',  // Use the downloadURL if it exists
                manager: {
                    ...club.toObject().manager,
                    img: logoObj2 ?? "",
                }
            };
        });

        sendApiResponse(res, 'OK', data, 'Successfully fetched list of Clubs');
    } catch (error) {
        next(error);
    }
}
// Updated controller function
export const getClubByIdReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: IClub = await getClubById(req.params.id);
        sendApiResponse(res, 'OK', data, 'Successfully fetched club');
    } catch (error) {
        if ((error as any).message === 'ClubNotFound') {
            sendApiResponse(res, 'NOT FOUND', null, 'club Not Found');
        } else {
            next(error); // Pass the error to the error-handling middleware for unexpected errors
        }
    }
};

// Service function to fetch the club data
export const getClubById = async (id: string | Types.ObjectId): Promise<IClub> => {
    const _data = await club.findById(id)
        .populate('logo')
        .populate('manager.img')
        .sort({ 'name': 1 });

    if (!_data) {
        throw new Error('ClubNotFound'); // Throw an error if the school is not found
    }

    const logoObj = (_data.logo as unknown as IFileModel).downloadURL;
    const logoObj2 = (_data.manager.img as unknown as IFileModel).downloadURL; // Ensure that club.logo is properly typed

    const data: IClub = {
        ..._data.toObject(),
        logo: logoObj ?? '',
        manager: {
            ..._data.toObject().manager,
            img: logoObj2 ?? "",
        }
    };

    delete data.password;
    return data; // Return the data to the controller function
};
const userNameExist = async (username: string) => {
    const school = await club.find({ username: username });
    return school;
}
export const createClub = async (req: Request, res: Response, next: NextFunction) => {
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
        const _file1 = await uploadFiles(req.body.name, file1, process.env.Club_FOLDER ?? '',);
        const _file2 = await uploadFiles(req.body.manager.name, file2, process.env.MANAGER_FOLDER ?? '',);
        const newClub = new club({ ...req.body, _id: new mongoose.Types.ObjectId() });
        if (_file1 && _file2) {
            newClub.logo = _file1._id;
            newClub.manager.img = _file2._id;
        }
        else {
            return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
                `File upload Failed`);
        }
        newClub.save();
        if (!newClub) {
            return sendApiResponse(res, 'CONFLICT', null, 'club Not Created');
        }
        delete newClub.password;

        sendApiResponse(res, 'CREATED', newClub,
            `Added club successfully`);
    } catch (error) {
        next(error);
    }
}
export const updateClub = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedClub = req.body;
        const prevClub = await club.findById(req.params.id).populate('logo').populate('manager.img');
        if (!prevClub) {
            return sendApiResponse(res, 'NOT FOUND', null, 'club Not Found');
        }
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const prevClubLogo = (prevClub?.logo as unknown as IFileModel);
        const isSameLogo = prevClubLogo.downloadURL === _updatedClub.logo;
        let _file: IFileModel | null = null;
        const file1 = files?.file1?.[0];
        if (!isSameLogo && file1) {
            _file = (await uploadFiles(req.body.name, file1, process.env.Club_FOLDER ?? '', prevClubLogo.fileId));
            _updatedClub.logo = _file?._id
        }
        else {
            _updatedClub.logo = prevClub?.logo
        }
        const prevManImg = (prevClub?.manager.img as unknown as IFileModel);
        const isSameManImg = prevManImg.downloadURL === _updatedClub.manager.img;
        const file2 = files?.file2?.[0];
        if (!isSameManImg && file2) {
            _file = (await uploadFiles(req.body.manager.name, file2, process.env.MANAGER_FOLDER ?? '', prevManImg.fileId));
            _updatedClub.manager.img = _file?._id
        }
        else {
            _updatedClub.manager.img = prevClub?.manager.img
        }
        if (req.body.password === '')
            _updatedClub.password = prevClub?.password
        const updatedClub = await club.findByIdAndUpdate(req.params.id, _updatedClub);
        if (!updatedClub) {
            return sendApiResponse(res, 'CONFLICT', null, 'club Not Updated');
        }
        delete _updatedClub.password;

        sendApiResponse(res, 'OK', _updatedClub,
            `club updated successfully`);
    } catch (error) {
        next(error);
    }
}

// Define the type for the score result
interface ClubScore {
    _id: Types.ObjectId;       // club ID
    totalPoints: number;       // Total points earned by the school
}
export const calculateClubScores: () => Promise<ClubScore[]> = async () => {
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
                firstClubIds: { $map: { input: "$firstPlaceStudents", as: "student", in: "$$student.school" } },
                secondClubIds: { $map: { input: "$secondPlaceStudents", as: "student", in: "$$student.school" } },
                thirdClubIds: { $map: { input: "$thirdPlaceStudents", as: "student", in: "$$student.school" } },
            },
        },
    ]);

    // Prepare to assign scores to schools
    const schoolScores: Record<string, number> = {};

    // Iterate through all events and calculate scores
    events.forEach(event => {
        // Add 5 points for each school in the first place
        event.firstClubIds.forEach((schoolId: Types.ObjectId) => {
            schoolScores[schoolId.toString()] = (schoolScores[schoolId.toString()] || 0) + 5;
        });

        // Add 3 points for each school in the second place
        event.secondClubIds.forEach((schoolId: Types.ObjectId) => {
            schoolScores[schoolId.toString()] = (schoolScores[schoolId.toString()] || 0) + 3;
        });

        // Add 1 point for each school in the third place
        event.thirdClubIds.forEach((schoolId: Types.ObjectId) => {
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

export const getClubLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    console.log({ username, password }, req.body);
    try {
        const _data = await club.findOne({ username: username, password: password })
            .populate('logo')
            .sort({ 'name': 1 });
        if (!_data) {
            return sendApiResponse(res, 'UNAUTHORIZED', null, 'Invalid Username or Password');
        }
        const logoObj = (_data.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const schoolScore = await calculateClubScores();

        const data: IClub = {
            ..._data.toObject(),  // Convert mongoose document to a plain object
            logo: logoObj ?? '', // Use the downloadURL if it exists
            score: schoolScore.find(sclScr => sclScr._id.equals(req.params.id))?.totalPoints ?? 0

        };
        delete data.password;
        sendApiResponse(res, 'OK', data, 'Successfully fetched club');
    } catch (error) {
        next(error);
    }
}

export const loggedClub = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('hle');

        const data: IClub = res.locals.school;
        sendApiResponse(res, 'OK', data, 'Successfully fetched club');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};