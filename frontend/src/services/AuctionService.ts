import axios from 'axios';
import { IAuction } from '../types/AuctionType';
import { getStandardResponse, getStandardSocketResponse } from './CommonServices';
import { IBid } from '../types/BidType';
import { IPlayer } from '../types/PlayerType';

const useAuction = () => {
  return {
    update: (createAuction: IAuction) =>
      getStandardResponse<IAuction>(axios.patch(`/auction/${createAuction._id}`, { ...createAuction })),
    getById: (id: string) => getStandardResponse<IAuction>(axios.get(`/auction/${id}`)),
    start: (player:string) => getStandardResponse<IAuction>(axios.post(`/auction/start`, {player})),
    stop: () => getStandardResponse<IAuction>(axios.post(`/auction/stop`, {})),
    switchPlayer: (player:string) => getStandardResponse<IAuction>(axios.post(`/auction/nextPlayer`, {player})),
    placeBid: (club: string, player: string, bid: number) => getStandardResponse<IBid>(axios.post(`/auction/bid`, { club, player, bid })),
    // placeBid: (club: string, player: string, bid: number) => getStandardSocketResponse<IBid>(axios.post(`/auction/`, { club, player, bid })),
  }
};


export default useAuction;

