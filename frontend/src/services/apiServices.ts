import axios from '../utils/axiosCustomize';

export const changePassword = (oldPassword: string, newPassword: string) => {
  const URL_BACKEND = '/user/change-password';
  const data = { oldPassword, newPassword };
  return axios.patch(URL_BACKEND, data);
};