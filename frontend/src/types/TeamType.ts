export interface ICreatableTeam {
    name: string;
    code: string;
    logo: string;
    username: string;
    password: string;
    isAdmin:boolean;
}
export interface ITeam extends ICreatableTeam {
    _id: string;
    score?: number;
}
