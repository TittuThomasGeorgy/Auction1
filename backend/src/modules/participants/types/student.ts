import { Types } from "mongoose";
import { ITeam } from "../../team/types/team";

export interface IStudent {
    _id: Types.ObjectId;
    logo: Types.ObjectId | string;
    name: string;
    studentClass: number;
    school: Types.ObjectId | ITeam;
    score?: number;
}