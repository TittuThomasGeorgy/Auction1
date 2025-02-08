import axios from 'axios';
import { getStandardResponse } from './CommonServices';
import { IPlayer } from '../types/PlayerType';
import { IBid } from '../types/BidType';

const usePlayer = () => {
  return {
    create: (createPlayer: IPlayer, file: File) =>
      getStandardResponse<IPlayer>(axios.post('/player/', { ...createPlayer, file: file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    update: (createPlayer: IPlayer, file: File | undefined) =>
      getStandardResponse<IPlayer>(axios.patch(`/player/${createPlayer._id}`, { ...createPlayer, file: file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    getAll: (params: { searchKey?: string, filter?: 'all' | 'sold' | 'unsold', club?: string }) => getStandardResponse<IPlayer[]>(axios.get('/player/', { params: { searchKey: params.searchKey, filter: params.filter, club: params.club } })),
    getAllBids: (id: string) => getStandardResponse<IBid[]>(axios.get(`/player/${id}/bid`)),
    getById: (id: string) => getStandardResponse<IPlayer>(axios.get(`/player/${id}`)),
    delete: (id: string) =>
      getStandardResponse<IPlayer>(axios.delete(`/player/${id}`)),
    removeClub: (id: string) =>
      getStandardResponse<IPlayer>(axios.delete(`/player/${id}/club`)),
    manualSell: (player: string, club: string, bid: number,) => getStandardResponse<IBid>(axios.post(`/player/${player}/sell`, { player, club, bid })),

  }
};
export default usePlayer;
