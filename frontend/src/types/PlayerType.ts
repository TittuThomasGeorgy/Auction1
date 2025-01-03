export interface ICreatablePlayer {
    name: string;
    image: string;
    position: 'ST' | 'CM' | 'DF' | 'GK',
    basePrice:number;
    bid?:string;
    club?:string;
}
