import { IBid } from "./BidType";

export interface IAuction {
    _id: string;
    player: string;
    bid: IBid | null;
    timeRemaining?: number;
    status: 'pause' | 'live' | 'stopped';
    type:'football'|'cricket';
    name:string;
}
