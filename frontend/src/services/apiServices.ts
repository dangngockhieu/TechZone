import axios from '../utils/axiosCustomize';
// ========== User API ==========

export const changePassword = (oldPassword: string, newPassword: string) => {
  const URL_BACKEND = '/user/change-password';
  const data = { oldPassword, newPassword };
  return axios.patch(URL_BACKEND, data);
};

// ========== Auth API ==========

export const register = (email: string, name: string, password: string) => {
  const URL_BACKEND = '/auth/register';
  const data = { email, name, password };
  return axios.post(URL_BACKEND, data);
};

export const login = (email: string, password: string) => {
  const URL_BACKEND = '/auth/login';
  const data = { email, password };
  return axios.post(URL_BACKEND, data, { withCredentials: true });
};

export const logout = () => {
  const URL_BACKEND = '/auth/logout';
  return axios.post(URL_BACKEND, {}, { withCredentials: true });
};

export const sendResetPassword = (email: string) => {
  const URL_BACKEND = '/auth/send-reset-password';
  const data = { email };
  return axios.post(URL_BACKEND, data);
};

export const resetPassword = (email: string, code: string, newPassword: string) => {
  const URL_BACKEND = '/auth/reset-password';
  const data = { email, code, newPassword };
  return axios.post(URL_BACKEND, data);
};