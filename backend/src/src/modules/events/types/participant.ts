import { Types } from "mongoose";

export interface IParticipant {
    _id: Types.ObjectId;
    student: Types.ObjectId;
    event: Types.ObjectId;
    score: {
        judge1: number;
        judge2: number;
        judge3: number;
    }
}
