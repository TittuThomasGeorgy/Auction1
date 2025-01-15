import axios from 'axios';
import { IAuction } from '../types/AuctionType';
import { getStandardResponse } from './CommonServices';
import { IBid } from '../types/BidType';
import { IPlayer } from '../types/PlayerType';

const useAuction = () => {
  return {
    update: (createAuction: IAuction) =>
      getStandardResponse<IAuction>(axios.patch(`/auction/${createAuction._id}`, { ...createAuction })),
    getById: (id: string) => getStandardResponse<IAuction>(axios.get(`/auction/${id}`)),
    placeBid: (club: string, player: string, bid: number) => getStandardResponse<IBid>(axios.post(`/auction/`, { club, player, bid })),
    start: () => getStandardResponse<IAuction>(axios.post(`/auction/start`, {})),
    stop: () => getStandardResponse<IAuction>(axios.post(`/auction/stop`, {})),
  }
};
export default useAuction;

