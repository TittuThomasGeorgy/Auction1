import axios from 'axios';
import { ITeam } from '../types/TeamType';
import { getStandardResponse } from './CommonServices';

const useTeam = () => {
  return {
    create: (createTeam: ITeam, file: File | undefined) =>
      getStandardResponse<ITeam>(axios.post('/team/', { ...createTeam, file: file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    update: (createTeam: ITeam, file: File | undefined) =>
      getStandardResponse<ITeam>(axios.patch(`/team/${createTeam._id}`, { ...createTeam, file: file }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    getAll: (searchKey?: string) => getStandardResponse<ITeam[]>(axios.get('/team/', { params: { searchKey: searchKey } })),
    getById: (id: string) => getStandardResponse<ITeam>(axios.get(`/team/${id}`)),

  }
};
export default useTeam;
