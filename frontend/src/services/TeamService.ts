import axios from 'axios';
import { ITeam } from '../types/TeamType';
import { getStandardResponse } from './CommonServices';

const useTeam = () => {
  return {
    create: (createTeam: ITeam, file1: File | undefined, file2: File | undefined) =>
      getStandardResponse<ITeam>(axios.post('/team/', { ...createTeam, file1: file1, file2: file2}, { headers: { 'Content-Type': 'multipart/form-data' } })),
    update: (createTeam: ITeam, file1: File | undefined, file2: File | undefined) =>
      getStandardResponse<ITeam>(axios.patch(`/team/${createTeam._id}`, { ...createTeam, file1: file1, file2: file2}, { headers: { 'Content-Type': 'multipart/form-data' } })),
    getAll: (searchKey?: string) => getStandardResponse<ITeam[]>(axios.get('/team/', { params: { searchKey: searchKey } })),
    getById: (id: string) => getStandardResponse<ITeam>(axios.get(`/team/${id}`)),

  }
};
export default useTeam;
