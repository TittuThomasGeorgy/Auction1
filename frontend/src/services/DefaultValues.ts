import { IPlayer, PlayerPosition } from "../types/PlayerType";

export const defPlayer: IPlayer = {
    _id: '',
    name: '',
    image: '',
    position: 'ST',
    basePrice: 0,
}


export const defClub = {
    _id: '',
    name: '',
    address: '',
    code: '',
    logo: '',
    username: '',
    password: '',
    isAdmin: false,
    manager: {
        img: '',
        name: '',
    },
    balance: 0,
}

export const positions: PlayerPosition[] = ['ST', 'CM', 'DF', 'GK']
