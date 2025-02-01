export interface ICreatableClub {
    name: string;
    code: string;
    logo: string;
    username: string;
    password: string;
    isAdmin: boolean;
    manager: {
        img: string;
        name: string;
    }
    balance: number;
}
export interface IClub extends ICreatableClub {
    _id: string;
}
