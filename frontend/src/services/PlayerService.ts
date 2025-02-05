import axios from 'axios';
import { getStandardResponse } from './CommonServices';
import { IPlayer } from '../types/PlayerType';

const usePlayer = () => {
  return {
    create: (createPlayer: IPlayer, file: File) =>
      getStandardResponse<IPlayer>(axios.post('/player/', { ...createPlayer, file: file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    update: (createPlayer: IPlayer, file: File | undefined) =>
      getStandardResponse<IPlayer>(axios.patch(`/player/${createPlayer._id}`, { ...createPlayer, file: file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    getAll: (params: { searchKey?: string, filter?: 'all' | 'sold' | 'unsold', club?: string }) => getStandardResponse<IPlayer[]>(axios.get('/player/', { params: { searchKey: params.searchKey, filter: params.filter, club: params.club } })),
    getById: (id: string) => getStandardResponse<IPlayer>(axios.get(`/player/${id}`)),
    delete: (id: string) =>
      getStandardResponse<IPlayer>(axios.delete(`/player/${id}`)),

  }
};
export default usePlayer;
