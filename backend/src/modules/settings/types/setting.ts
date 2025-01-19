import { Types } from "mongoose";

export interface ISettings {
    _id: Types.ObjectId;
   initialBalance:number;
   playersPerClub:number;
   bidTime:number;
}
