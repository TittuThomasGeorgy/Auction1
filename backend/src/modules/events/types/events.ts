import { Types } from "mongoose";

export interface IEvent {
    _id: Types.ObjectId;
    name: string;
    time: string;
    category: Category;
    logo: Types.ObjectId | string;
    type: 'IND' | 'GRP';
    result?: {
        first: Types.ObjectId[];
        second: Types.ObjectId[];
        third: Types.ObjectId[];
    }
}
export type Category = 0 | 1 | 2 | 3 | 4 | 5
