export interface IPlayer {
    _id:string;
    name: string;
    image: string;
    position: PlayerPosition;   
    basePrice:number;
    bid?:string;
    club?:string;
}
export type PlayerPosition='ST' | 'CM' | 'DF' | 'GK';