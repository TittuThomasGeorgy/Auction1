import { Types } from "mongoose";
import { ISchool } from "../../school/types/school";

export interface IStudent {
    _id: Types.ObjectId;
    logo: Types.ObjectId | string;
    name: string;
    studentClass: number;
    school: Types.ObjectId | ISchool;
    score?: number;
}