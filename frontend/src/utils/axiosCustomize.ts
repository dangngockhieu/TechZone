import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import NProgress from 'nprogress'
import { toast } from 'react-toastify'

import { updateAccessToken, doLogout } from '../redux/slices/userSlice'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
  minimum: 0.1,
})

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

let isRefreshing = false
let refreshSubscribers: Array<(newAccessToken: string) => void> = []

const onRefreshed = (newAccessToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: (newAccessToken: string) => void) => {
  refreshSubscribers.push(callback)
}

instance.interceptors.request.use(
  async (config) => {
    const { store } = await import('../redux/store')
    const access_token = store.getState()?.user?.account?.access_token
    if (access_token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = 'Bearer ' + access_token
    }

    NProgress.start()
    return config
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  (response) => {
    NProgress.done()
    return response
  },

  async (error: AxiosError) => {
    NProgress.done()

    // cSpell:disable-next-line
    interface RetryableRequest extends InternalAxiosRequestConfig {
      _retry?: boolean
    }
    // cSpell:disable-next-line
    const originalRequest = (error.config ?? {}) as RetryableRequest

    if (!error.response) {
      // cSpell:disable-next-line
      toast.error('Không thể kết nối đến máy chủ!')
      return Promise.reject(error)
    }

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? '').includes('auth/refresh-token')
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newAccessToken) => {
            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken
            resolve(instance(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        )

        if (res?.data?.success && res?.data?.data?.access_token) {
          const newAccess = res.data.data.access_token as string

          const { store } = await import('../redux/store')
          store.dispatch(updateAccessToken(newAccess))

          onRefreshed(newAccess)
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccess
          return instance(originalRequest)
        }

        throw new Error('Invalid refresh response')
      } catch (err) {
        // cSpell:disable-next-line
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!')
        const { store } = await import('../redux/store')
        store.dispatch(doLogout())
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response.status === 403) {
      // cSpell:disable-next-line
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!')
      const { store } = await import('../redux/store')
      store.dispatch(doLogout())
      window.location.href = '/login'
      return Promise.reject(error)
    }

    return (error.response as { data: unknown }).data || Promise.reject(error)
  },
)

export default instance
