import { IPlayer, PlayerPosition } from "../types/PlayerType";
import { ISettings } from "../types/SettingsType";

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

export const defSettings: ISettings = {
    _id: '',
    bidTime: 0,
    addOnTime: 0,
    initialBalance: 0,
    playersPerClub: 0,
    bidMultiple: 100,
    keepMinBid: true,
    minBid: 100,
}