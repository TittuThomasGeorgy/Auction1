import { Types } from "mongoose";
import { IClub } from "../../club/types/club";

export interface IPlayer {
    _id: Types.ObjectId;
    name: string;
    image: Types.ObjectId | string;
    position: PlayerPosition;
    basePrice: number;
    bid?: string;
    club?: string;
}
export type PlayerPosition = 'ST' | 'CM' | 'DF' | 'GK';