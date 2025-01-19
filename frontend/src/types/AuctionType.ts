
export interface IAuction {
    _id: string;
    player:  string;
    bid:  string;
    timeRemaining?:number;
    status: 'pause' | 'live' | 'stopped'
}
