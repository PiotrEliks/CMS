import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    withCredentials: true,
})

export function attach401Interceptor(onUnauthorized: () => void) {
    const id = api.interceptors.response.use(
        (res) => res,
        (err) => {
            const status = err?.response?.status
            const url = err?.config?.url as string | undefined

            const isCheck =
                url?.endsWith('/auth/check') || url?.includes('/auth/check')

            if (status === 401 && !isCheck) {
                onUnauthorized()
            }
            return Promise.reject(err)
        }
    )
    return () => api.interceptors.response.eject(id)
}
