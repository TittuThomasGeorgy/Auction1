import mongoose, { Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import Events from "../models/Events";
import { NextFunction, Request, Response } from "express";
import { Category, IEvent } from "../types/events";
import { IFileModel } from "../../common/types/fileModel";
import { uploadFiles } from "../../common/controllers/files.controller";
import { IParticipant } from "../types/participant";
import Participant from "../models/Participate";
import { getStudentById } from "../../participants/controllers/students.controller";

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchKey = req.query.searchKey;
        const categories = ['Nursery', 'Juniors', 'CAT I', 'CAT II', 'CAT III', 'CAT IV'];
        let categoryIndex: number[] = [];

        // Check if the searchKey matches any category element with regex
        const searchRegex = new RegExp(searchKey as string, 'i');
        for (let i = 0; i < categories.length; i++) {
            if (searchRegex.test(categories[i])) {
                categoryIndex.push(i);
            }
        }

        const category = req.query.category;

        const _data = await Events.find({
            ...(searchKey
                ? {
                    $or: [
                        {
                            name: {
                                $regex: searchKey as string,
                                $options: 'i',
                            },
                        },
                        ...(categoryIndex !== null
                            ? [{ category: { $in: categoryIndex } }] // Direct match for category index if regex matches an element
                            : []),
                        {
                            time: {
                                $regex: searchKey as string,
                            },
                        },
                    ],
                }
                : {}),
            ...(category ? {
                category: category
            } : {})
        })
            .populate('logo')
            .sort({ 'category': 1, 'name': 1 })
        const data: IEvent[] = _data.map((eve) => {
            const logoObj = (eve.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
            return {
                ...eve.toObject(),  // Convert mongoose document to a plain object
                logo: logoObj ?? ''  // Use the downloadURL if it exists
            };
        });

        sendApiResponse(res, 'OK',
            data,
            'Successfully fetched list of Events',
        );
    } catch (error) {
        next(error);
    }
}
export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _data = await Events.findById((req.params.id))
            .populate('logo')
            .sort({ 'name': 1 });
        if (!_data) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Event Not Found');
        }
        const logoObj = (_data.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        // If your logo is being populated correctly, we need to handle it properly in the map function
        const data: IEvent = {
            ..._data.toObject(),  // Convert mongoose document to a plain object
            logo: logoObj ?? ''  // Use the downloadURL if it exists

        };
        sendApiResponse(res, 'OK', data, 'Successfully fetched Event');
    } catch (error) {
        next(error);
    }
}


export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }
        const _file = await uploadFiles(req.body.name, req.file, process.env.EVENT_FOLDER ?? '');
        const newEvents = await Promise.all(req.body.categories.map(async (category: Category) => {
            const newEv = await new Events({ ...req.body, _id: new mongoose.Types.ObjectId(), category: category, logo: _file?._id }).save();
            return newEv;
        }));
        if (!(newEvents.length > 0)) {
            return sendApiResponse(res, 'CONFLICT', null, 'Event Not Created');
        }
        sendApiResponse(res, 'CREATED', newEvents, 'Added Events successfully');
    } catch (error) {
        next(error);
    }
}
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedEvent = req.body;
        const prevEvent = await Events.findById(req.params.id).populate('logo');
        if (!prevEvent) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Event Not Found');
        }

        const prevEventLogo = (prevEvent?.logo as unknown as IFileModel);
        const isSameLogo = prevEventLogo.downloadURL === _updatedEvent.logo;
        let _file: IFileModel | null = null;
        if (!isSameLogo && req.file) {
            _file = (await uploadFiles(req.body.name, req.file, process.env.EVENT_FOLDER ?? ''));
            _updatedEvent.logo = _file?._id
        }
        else {
            _updatedEvent.logo = prevEvent?.logo
        }

        const updatedEvent = await Events.findByIdAndUpdate(req.params.id, { ...req.body, });
        if (!updatedEvent) {
            return sendApiResponse(res, 'CONFLICT', null, 'Event Not Updated');
        }
        sendApiResponse(res, 'OK', updatedEvent,
            `Event updated successfully`);
    } catch (error) {
        next(error);
    }
}

export const getParticipatedEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.query.id;
        const type: 'event' | 'student' = req.query.type as 'event' | 'student'
        const data = await Participant.find({
            ...(type === 'student' ? {
                student: id,
            } : {
                event: id,
            })
        })

        sendApiResponse(res, 'OK',
            data,
            'Successfully fetched list of participation',
        );
    } catch (error) {
        next(error);
    }
}

export const participateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId, eventsId: eventsIdStrings } = req.body;

        // Limit check
        if (eventsIdStrings.length > 5) {
            return sendApiResponse(res, 'CONFLICT', null, 'Maximum limit exceeded');
        }

        // Convert all event IDs to ObjectId
        const eventsId: Types.ObjectId[] = eventsIdStrings.map((id: string) => new mongoose.Types.ObjectId(id));
        //    console.log('Converted Events IDs:', eventsId);

        // Find already participated events
        const participatedEvents: IParticipant[] = await Participant.find({ student: studentId });
        const prevParticipatedEvents = participatedEvents.map((participant) => participant.event.toString());
        //    console.log('Previously Participated Event IDs:', prevParticipatedEvents);

        // Enroll in new events
        const newEnrollments = eventsId.filter(eventId => !prevParticipatedEvents.includes(eventId.toString()));
        //    console.log('New Enrollments:', newEnrollments);

        await Promise.all(
            newEnrollments.map(async (eventId) => {
                //    console.log(`Enrolling in new event ID: ${eventId}`);
                const newParticipant = new Participant({
                    _id: new mongoose.Types.ObjectId(),
                    student: new mongoose.Types.ObjectId(studentId),
                    event: eventId
                });
                await newParticipant.save();
                console.log(`Enrolled in event ID: ${eventId}`);
            })
        );

        // Unenroll from events that are no longer in the list
        const unenrolledEvents = prevParticipatedEvents.filter(eventId => !eventsIdStrings.includes(eventId));
        //    console.log('Unenrollments:', unenrolledEvents);

        await Promise.all(
            unenrolledEvents.map(async (eventId) => {
                //    console.log(`Unenrolling from event ID: ${eventId}`);
                await Participant.findOneAndRemove({ student: studentId, event: eventId });
                console.log(`Unenrolled from event ID: ${eventId}`);
            })
        );

        sendApiResponse(res, 'OK', { enrolled: newEnrollments, unenrolled: unenrolledEvents }, 'Participated successfully');
        console.log('Participation update successful');
    } catch (error) {
        console.error('Error during participation update:', error);
        next(error);
    }
};

export const editResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const results: IParticipant[] = req.body;
        const eventId = results[0].event;
        const participantScore = await Promise.all(results.map(async _result => {
            const _data = await Participant.findByIdAndUpdate(_result._id, { score: _result.score });
            if (!_data) {
                return sendApiResponse(res, 'CONFLICT', null, `Result ${_result._id} Not Updated`);
            }
            return _data;
        }))
        const result = await getScoresByEventIds(eventId);

        const _event = await Events.findByIdAndUpdate(eventId, { result: { first: result.first?.students, second: result.second?.students, third: result.third?.students } })
        // console.log(_event)
        const data = {
            event: _event,
            participant: participantScore,
        }
        sendApiResponse(res, 'OK', data,
            `Results updated successfully`);
    } catch (error) {
        next(error);
    }
}
interface ScoreGroup {
    _id: number; // This represents the totalScore
    students: Types.ObjectId[];
}

interface TopScores {
    first?: ScoreGroup;
    second?: ScoreGroup;
    third?: ScoreGroup;
}

const getScoresByEventIds: (eventId: Types.ObjectId) => Promise<TopScores> = async (eventId) => {
    try {
        const results = await Participant.aggregate([
            {
                $match: { event: new Types.ObjectId(eventId) }
            },
            {
                $project: {
                    student: 1,
                    totalScore: {
                        $add: [
                            "$score.judge1",
                            "$score.judge2",
                            "$score.judge3"
                        ]
                    }
                }
            },
            { $sort: { totalScore: -1 } }, // Sort by totalScore in descending order
            {
                $group: {
                    _id: "$totalScore", // Group by totalScore to handle ties
                    students: { $push: "$student" }
                }
            },
            { $sort: { _id: -1 } }, // Sort scores in descending order after grouping
            { $limit: 3 } // Limit to the top 3 unique scores
        ]);

        // Map results to separate first, second, and third positions
        const [first, second, third] = results;
        return { first, second, third };
    } catch (error) {
        console.error("Error fetching top three scores with ties:", error);
        throw error;
    }
}