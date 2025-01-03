import { Types } from "mongoose";

export interface IClub {
    _id: Types.ObjectId;
    name: string;
    code: string;
    logo: Types.ObjectId | string;
    score?: number;
    username?: string;
    password?: string;
    isAdmin:boolean;
    manager:{
        img:Types.ObjectId | string;
        name:string;
    }
}
