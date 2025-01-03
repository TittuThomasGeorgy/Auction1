export interface ICreatableTeam {
    name: string;
    code: string;
    logo: string;
    username: string;
    password: string;
    isAdmin:boolean;
    manager:{
        img:string;
        name:string;
    }
}
export interface ITeam extends ICreatableTeam {
    _id: string;
    score?: number;
}
