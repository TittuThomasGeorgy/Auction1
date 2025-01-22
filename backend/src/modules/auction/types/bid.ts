import { Types } from "mongoose";

export interface IBid {
    _id: Types.ObjectId;
    player: Types.ObjectId | string;
    club: Types.ObjectId | string;
    bid: number;
    state: 0 | 1;
}
