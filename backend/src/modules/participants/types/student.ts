import { Types } from "mongoose";
import { IClub } from "../../club/types/club";

export interface IStudent {
    _id: Types.ObjectId;
    logo: Types.ObjectId | string;
    name: string;
    studentClass: number;
    school: Types.ObjectId | IClub;
    score?: number;
}