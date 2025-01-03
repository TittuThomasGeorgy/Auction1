import mongoose, { ObjectId, Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { NextFunction, Request, Response } from "express";
import Student from "../models/Student";
import { uploadFiles } from "../../common/controllers/files.controller";
import { IFileModel } from "../../common/types/fileModel";
import { IStudent } from "../types/student";
import { ITeam } from "../../school/types/team";
import Participant from "../../events/models/Participate";
import Events from "../../events/models/Events";

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if the searchKey matches any studentClass element with regex
        let searchKey = req.query.searchKey as string;
        const classNames = ["KG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        let classIndexes: number[] = [];
        const school = req.query.school;
        // Check if the searchKey matches any studentClass element with regex
        const searchRegex = new RegExp(searchKey, 'i');
        for (let i = 0; i < classNames.length; i++) {
            if (searchRegex.test(classNames[i])) {
                classIndexes.push(i);
            }
        }

        const _data = await Student.find({
            ...(searchKey
                ? {
                    $or: [
                        {
                            name: {
                                $regex: searchKey,
                                $options: 'i',
                            },
                        },
                        ...(classIndexes.length > 0
                            ? [{ studentClass: { $in: classIndexes } }] // Use $in operator to match any of the indexes
                            : []),
                    ],
                }
                : {}),
            ...(school
                ? { school: school } : {})
        })
            .populate('logo')
            .sort({ 'studentClass': 1, 'name': 1 });

        // If your logo is being populated correctly, we need to handle it properly in the map function
        const data: IStudent[] = await Promise.all(_data.map(async (stud) => {
            const logoObj = (stud.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
            const score = await getStudentTotalScore(stud._id);

            return {
                ...stud.toObject(),  // Convert mongoose document to a plain object
                logo: logoObj ?? '',  // Use the downloadURL if it exists
                score: score,
            };
        }));

        sendApiResponse(res, 'OK', data, 'Successfully fetched list of Students');
    } catch (error) {
        next(error);
    }
}
export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _data = await Student.findById((req.params.id))
            .populate([
                {
                    path: 'school',
                    populate: {
                        path: 'logo',
                    },
                },
                { path: 'logo' },
            ])
            .sort({ 'name': 1 });
        if (!_data) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Student Not Found');
        }
        const logoObj = (_data.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        const logoObj2 = ((_data.school as ITeam).logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        const score = await getStudentTotalScore(new Types.ObjectId(req.params.id));
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const data: IStudent = {
            ..._data.toObject(),  // Convert mongoose document to a plain object
            logo: logoObj ?? '',  // Use the downloadURL if it exists
            school: {
                ...(_data.toObject().school as ITeam),  // Convert mongoose document to a plain object
                logo: logoObj2 ?? '',  // Use the downloadURL if it exists
            },
            score: score,

        };
        // console.log(data);

        sendApiResponse(res, 'OK', data, 'Successfully fetched Student');
    } catch (error) {
        next(error);
    }
}


export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }

        const _file = await uploadFiles(req.body.name, req.file, process.env.STUDENT_FOLDER ?? '',);

        const newStudent = new Student({ ...req.body, _id: new mongoose.Types.ObjectId() });
        if (_file) {
            newStudent.logo = _file._id;
        }
        newStudent.save();
        if (!newStudent) {
            return sendApiResponse(res, 'CONFLICT', null, 'Student Not Created');
        }
        sendApiResponse(res, 'CREATED', newStudent,
            `Added Student successfully`);
    } catch (error) {
        next(error);
    }
}
export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedStudent = req.body;
        const prevStudent = await Student.findById(req.params.id).populate('logo');
        if (!prevStudent) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Student Not Found');
        }

        const prevStudentLogo = (prevStudent?.logo as unknown as IFileModel);
        const isSameLogo = prevStudentLogo.downloadURL === _updatedStudent.logo;
        let _file: IFileModel | null = null;
        if (!isSameLogo && req.file) {
            _file = (await uploadFiles(req.body.name, req.file, process.env.STUDENT_FOLDER ?? '', prevStudentLogo.fileId));
            _updatedStudent.logo = _file?._id
        }
        else {
            _updatedStudent.logo = prevStudent?.logo
        }

        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, { ...req.body, });
        if (!updatedStudent) {
            return sendApiResponse(res, 'CONFLICT', null, 'Student Not Updated');
        }
        sendApiResponse(res, 'OK', updatedStudent,
            `Student updated successfully`);
    } catch (error) {
        next(error);
    }
}


const getStudentTotalScore = async (studentId: Types.ObjectId): Promise<number> => {
    try {
        const studentObjectId = new Types.ObjectId(studentId); // Convert studentId to ObjectId

        // Aggregate the score based on student's placements
        const events = await Events.aggregate([
            {
                $project: {
                    firstPlace: {
                        $cond: { 
                            if: { $in: [studentObjectId, { $ifNull: ["$result.first", []] }] }, 
                            then: 5, 
                            else: 0 
                        }
                    },
                    secondPlace: { 
                        $cond: { 
                            if: { $in: [studentObjectId, { $ifNull: ["$result.second", []] }] }, 
                            then: 3, 
                            else: 0 
                        }
                    },
                    thirdPlace: { 
                        $cond: { 
                            if: { $in: [studentObjectId, { $ifNull: ["$result.third", []] }] }, 
                            then: 1, 
                            else: 0 
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null, // Group all events together
                    totalScore: { $sum: { $add: ["$firstPlace", "$secondPlace", "$thirdPlace"] } }
                }
            }
        ]);

        // Retrieve and return the total score or 0 if no results
        return events.length > 0 ? events[0].totalScore : 0;
    } catch (error) {
        console.error("Error calculating student's score:", error);
        throw error;
    }
};