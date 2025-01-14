
export interface IAuction {
    _id: string;
    player:  string;
    bid:  string;
    status: 'pause' | 'live' | 'stopped'
}
