import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

/**
 * Retrieves the base URL for API requests from environment variables.
 * Falls back to an empty string if not configured.
 *
 * @returns {string} The base URL for API requests
 */
const getBaseUrl = (): string => import.meta.env.VITE_API_URL || ''

/**
 * Retrieves the request timeout duration from environment variables.
 * Falls back to 10000ms (10 seconds) if not configured.
 *
 * @returns {number} The timeout duration in milliseconds
 */
const getTimeout = (): number => Number(import.meta.env.VITE_API_TIMEOUT) || 10000

/**
 * Creates and configures an Axios instance with default settings and interceptors.
 *
 * @returns {AxiosInstance} A configured Axios instance
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseUrl(),
    timeout: getTimeout(),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  /**
   * Request interceptor to modify requests before they are sent.
   * Can be used to add authentication tokens, logging, etc.
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: unknown) => {
      return Promise.reject(error)
    },
  )

  /**
   * Response interceptor to handle responses and errors globally.
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error: unknown) => {
      return Promise.reject(error)
    },
  )

  return instance
}

export const apiInstance = createApiInstance()

export type { AxiosRequestConfig, AxiosResponse }
