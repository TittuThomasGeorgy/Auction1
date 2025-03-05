import axios from 'axios';
import { IClub } from '../types/ClubType';
import { getStandardResponse } from './CommonServices';

const useClub = () => {
  return {
    create: (createClub: IClub, file1: File | undefined, file2: File | undefined) =>
      getStandardResponse<IClub>(axios.post('/club/', { ...createClub, file1: file1, file2: file2 }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    update: (createClub: IClub, file1: File | undefined, file2: File | undefined) =>
      getStandardResponse<IClub>(axios.patch(`/club/${createClub._id}`, { ...createClub, file1: file1, file2: file2 }, { headers: { 'Content-Type': 'multipart/form-data' } })),
    getAll: (searchKey?: string) => getStandardResponse<IClub[]>(axios.get('/club/', { params: { searchKey: searchKey } })),
    getById: (id: string) => getStandardResponse<IClub>(axios.get(`/club/${id}`)),
    login: (username: string, password: string) =>
      getStandardResponse<IClub>(axios.post('/club/login', { username: username, password: password })),
    getMe: (id: string) =>
      getStandardResponse<IClub>(
        axios.get('/club/me', { headers: { authorization: id } })),
  }
};
export default useClub;
