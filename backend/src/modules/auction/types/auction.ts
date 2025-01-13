import { Types } from "mongoose";

export interface IAuction {
    _id: Types.ObjectId;
    player: Types.ObjectId | string;
    bid: Types.ObjectId | string;
    status: 'pause' | 'live' | 'stopped'
}
