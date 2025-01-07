import axios from 'axios';
import { ISettings } from '../types/SettingsType';
import { getStandardResponse } from './CommonServices';

const useSettings = () => {
  return {
    update: (createSettings: ISettings) =>
      getStandardResponse<ISettings>(axios.patch(`/settings/${createSettings._id}`, createSettings)),
    get: () => getStandardResponse<ISettings>(axios.get('/settings/')),

  }
};
export default useSettings;
