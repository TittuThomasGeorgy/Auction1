import mongoose, { ObjectId, Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { NextFunction, Request, Response } from "express";
import School from "../models/School";
import { uploadFiles } from "../../common/controllers/files.controller";
import { IFileModel } from "../../common/types/fileModel";
import { ISchool } from "../types/school";
import Events from "../../events/models/Events";

export const getSchools = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchKey = req.query.searchKey;
        const _data = await School.find({
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
        const schoolScore = await calculateSchoolScores();
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const data: ISchool[] = _data.map((scl) => {
            const logoObj = (scl.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
            delete scl.password;

            return {
                ...scl.toObject(),  // Convert mongoose document to a plain object
                logo: logoObj ?? '',  // Use the downloadURL if it exists
                score: schoolScore.find(sclScr => sclScr._id.equals(scl._id))?.totalPoints ?? 0
            };
        });

        sendApiResponse(res, 'OK', data, 'Successfully fetched list of Schools');
    } catch (error) {
        next(error);
    }
}
// Updated controller function
export const getSchoolByIdReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: ISchool = await getSchoolById(req.params.id);
        sendApiResponse(res, 'OK', data, 'Successfully fetched School');
    } catch (error) {
        if (error.message === 'SchoolNotFound') {
            sendApiResponse(res, 'NOT FOUND', null, 'School Not Found');
        } else {
            next(error); // Pass the error to the error-handling middleware for unexpected errors
        }
    }
};

// Service function to fetch the school data
export const getSchoolById = async (id: string | Types.ObjectId): Promise<ISchool> => {
    const _data = await School.findById(id)
        .populate('logo')
        .sort({ 'name': 1 });

    if (!_data) {
        throw new Error('SchoolNotFound'); // Throw an error if the school is not found
    }

    const logoObj = (_data.logo as unknown as IFileModel).downloadURL;
    const schoolScore = await calculateSchoolScores();

    const data: ISchool = {
        ..._data.toObject(),
        logo: logoObj ?? '',
        score: schoolScore.find(sclScr => sclScr._id.equals(id))?.totalPoints ?? 0
    };

    delete data.password;
    return data; // Return the data to the controller function
};
const userNameExist = async (username: string) => {
    const school = await School.find({ username: username });
    return school;
}
export const createSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }
        const isUserNameExist = await userNameExist(req.body.username);
        if (isUserNameExist.length > 0)
            return sendApiResponse(res, 'CONFLICT', null,
                `Username Already Exist`);
        const _file = await uploadFiles(req.body.name, req.file, process.env.SCHOOL_FOLDER ?? '',);
        const newSchool = new School({ ...req.body, _id: new mongoose.Types.ObjectId() });
        if (_file) {
            newSchool.logo = _file._id;
        }
        else {
            return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
                `File upload Failed`);
        }
        newSchool.save();
        if (!newSchool) {
            return sendApiResponse(res, 'CONFLICT', null, 'School Not Created');
        }
        sendApiResponse(res, 'CREATED', newSchool,
            `Added School successfully`);
    } catch (error) {
        next(error);
    }
}
export const updateSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedSchool = req.body;
        const prevSchool = await School.findById(req.params.id).populate('logo');
        if (!prevSchool) {
            return sendApiResponse(res, 'NOT FOUND', null, 'School Not Found');
        }

        const prevSchoolLogo = (prevSchool?.logo as unknown as IFileModel);
        const isSameLogo = prevSchoolLogo.downloadURL === _updatedSchool.logo;
        let _file: IFileModel | null = null;
        if (!isSameLogo && req.file) {
            _file = (await uploadFiles(req.body.name, req.file, process.env.SCHOOL_FOLDER ?? '', prevSchoolLogo.fileId));
            _updatedSchool.logo = _file?._id
        }
        else {
            _updatedSchool.logo = prevSchool?.logo
        }

        const updatedSchool = await School.findByIdAndUpdate(req.params.id, { ...req.body, });
        if (!updatedSchool) {
            return sendApiResponse(res, 'CONFLICT', null, 'School Not Updated');
        }
        sendApiResponse(res, 'OK', updatedSchool,
            `School updated successfully`);
    } catch (error) {
        next(error);
    }
}

// Define the type for the score result
interface SchoolScore {
    _id: Types.ObjectId;       // School ID
    totalPoints: number;       // Total points earned by the school
}
export const calculateSchoolScores: () => Promise<SchoolScore[]> = async () => {
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
                firstSchoolIds: { $map: { input: "$firstPlaceStudents", as: "student", in: "$$student.school" } },
                secondSchoolIds: { $map: { input: "$secondPlaceStudents", as: "student", in: "$$student.school" } },
                thirdSchoolIds: { $map: { input: "$thirdPlaceStudents", as: "student", in: "$$student.school" } },
            },
        },
    ]);

    // Prepare to assign scores to schools
    const schoolScores: Record<string, number> = {};

    // Iterate through all events and calculate scores
    events.forEach(event => {
        // Add 5 points for each school in the first place
        event.firstSchoolIds.forEach((schoolId: Types.ObjectId) => {
            schoolScores[schoolId.toString()] = (schoolScores[schoolId.toString()] || 0) + 5;
        });

        // Add 3 points for each school in the second place
        event.secondSchoolIds.forEach((schoolId: Types.ObjectId) => {
            schoolScores[schoolId.toString()] = (schoolScores[schoolId.toString()] || 0) + 3;
        });

        // Add 1 point for each school in the third place
        event.thirdSchoolIds.forEach((schoolId: Types.ObjectId) => {
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

export const getSchoolLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    console.log({ username, password }, req.body);
    try {
        const _data = await School.findOne({ username: username, password: password })
            .populate('logo')
            .sort({ 'name': 1 });
        if (!_data) {
            return sendApiResponse(res, 'UNAUTHORIZED', null, 'Invalid Username or Password');
        }
        const logoObj = (_data.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const schoolScore = await calculateSchoolScores();

        const data: ISchool = {
            ..._data.toObject(),  // Convert mongoose document to a plain object
            logo: logoObj ?? '', // Use the downloadURL if it exists
            score: schoolScore.find(sclScr => sclScr._id.equals(req.params.id))?.totalPoints ?? 0

        };
        delete data.password;
        sendApiResponse(res, 'OK', data, 'Successfully fetched School');
    } catch (error) {
        next(error);
    }
}

export const loggedSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('hle');

        const data: ISchool = res.locals.school;
        sendApiResponse(res, 'OK', data, 'Successfully fetched School');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};