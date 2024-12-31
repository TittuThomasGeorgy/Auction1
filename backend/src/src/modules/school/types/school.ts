import { Types } from "mongoose";

export interface ISchool {
    _id: Types.ObjectId;
    name: string;
    code: string;
    address: string;
    logo: Types.ObjectId | string;
    score?: number;
    username?: string;
    password?: string;
    isAdmin:boolean;
}
