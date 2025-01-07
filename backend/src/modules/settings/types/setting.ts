import { Types } from "mongoose";

export interface ISettings {
    _id: Types.ObjectId;
   initialBalance:Number;
   playersPerClub:Number;
   bidTime:Number;
}
