import axios from 'axios';
import { IAuction } from '../types/AuctionType';
import { getStandardResponse, getStandardSocketResponse } from './CommonServices';
import { IBid } from '../types/BidType';
import { IPlayer } from '../types/PlayerType';
import { IClub } from '../types/ClubType';

const useAuction = () => {
  return {
    create: (createAuction: IAuction, createClub: IClub, file: File) =>
      getStandardResponse<IAuction>(axios.post(`/auction/`, { auction: createAuction, club: createClub, file: file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    update: (createAuction: IAuction, createClub: IClub, file: File | undefined) =>
      getStandardResponse<IAuction>(axios.patch(`/auction/${createAuction._id}`, { auction: createAuction, club: createClub, file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    getAll: (params: { searchKey?: string, filter?: 'all' | 'football' | 'cricket' }) => getStandardResponse<IAuction[]>(axios.get(`/auction`, { params: { searchKey: params.searchKey, filter: params.filter } })),
    getAuction: () => getStandardResponse<IAuction>(axios.get(`/auction/`)),
    playPause: (action: 'resume' | 'pause') => getStandardResponse<IAuction>(axios.post(`/auction/pause`, { action })),
    start: (player: string) => getStandardResponse<IAuction>(axios.post(`/auction/start`, { player })),
    stop: () => getStandardResponse<IAuction>(axios.post(`/auction/stop`, {})),
    addTime: () => getStandardResponse<IAuction>(axios.post(`/auction/addTime`, {})),
    switchPlayer: (player: string) => getStandardResponse<IAuction>(axios.post(`/auction/nextPlayer`, { player })),
    sell: (player: string) => getStandardResponse<IAuction>(axios.post(`/auction/sell`, { player })),
    placeBid: (club: string, player: string, bid: number) => getStandardResponse<IBid>(axios.post(`/auction/bid`, { club, player, bid })),
    undoBid: () => getStandardResponse<IBid>(axios.post(`/auction/undoBid`, {})),
    // placeBid: (club: string, player: string, bid: number) => getStandardSocketResponse<IBid>(axios.post(`/auction/`, { club, player, bid })),
  }
};


export default useAuction;

