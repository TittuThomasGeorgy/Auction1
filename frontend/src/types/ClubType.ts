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
    type?: 'football' | 'cricket'
}
export interface IClub extends ICreatableClub {
    _id: string;
}
