import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { apiInstance } from './axios'
import { requestWithRetry } from './retry'

/**
 * Represents the supported HTTP methods.
 */
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'

/**
 * Configuration options for API requests.
 * Extends AxiosRequestConfig with additional retry options.
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  /**
   * The HTTP method to use for the request.
   * @default 'get'
   */
  method?: HttpMethod

  /**
   * Query parameters to append to the URL.
   */
  params?: Record<string, unknown>

  /**
   * Request body data for POST, PUT, PATCH requests.
   * Can be an object (JSON), FormData, or URLSearchParams.
   */
  data?: unknown

  /**
   * Maximum number of retry attempts. Overrides the environment variable if provided.
   */
  retryCount?: number

  /**
   * Delay between retries in milliseconds. Overrides the environment variable if provided.
   */
  retryDelay?: number
}

/**
 * Builds a request configuration object without executing the request.
 * Useful for creating reusable request configs.
 *
 * @param {string} url - The request URL
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {AxiosRequestConfig} The request configuration object
 *
 * @example
 * const config = api.buildRequest('/users', { method: 'get', params: { page: 1 } })
 */
const buildRequest = (url: string, config: ApiRequestConfig = {}): AxiosRequestConfig => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { method = 'get', params, data, retryCount, retryDelay, ...axiosConfig } = config

  const normalizedMethod = method.toLowerCase() as HttpMethod
  const isGetOrHead = normalizedMethod === 'get' || normalizedMethod === 'head'

  return {
    url,
    method: normalizedMethod,
    params: isGetOrHead ? data || params : params,
    data: isGetOrHead ? undefined : data,
    ...axiosConfig,
  }
}

/**
 * Executes an HTTP request with the specified method and configuration.
 * Supports automatic retry on network errors or 5xx server errors.
 *
 * @param {string} url - The request URL
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server
 *
 * @example
 * const response = await api.request('/users', { method: 'post', data: { name: 'John' } })
 */
const request = async (url: string, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  const requestConfig = buildRequest(url, config)
  return requestWithRetry(apiInstance, requestConfig, config.retryCount, config.retryDelay)
}

/**
 * Executes a GET request.
 * Supports query parameters via the `params` or `data` option.
 *
 * @param {string} url - The request URL
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server
 *
 * @example
 * const response = await api.get('/users', { params: { page: 1, limit: 10 } })
 */
const get = async (url: string, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  return request(url, { ...config, method: 'get' })
}

/**
 * Executes a POST request.
 * Supports request body via the `data` option (JSON, FormData, or URLSearchParams).
 * Also supports query parameters via the `params` option.
 *
 * @param {string} url - The request URL
 * @param {unknown} [data] - The request body data
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server
 *
 * @example
 * const response = await api.post('/users', { name: 'John' }, { params: { notify: true } })
 */
const post = async (url: string, data?: unknown, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  return request(url, { ...config, method: 'post', data })
}

/**
 * Executes a PUT request.
 * Supports request body via the `data` option (JSON, FormData, or URLSearchParams).
 * Also supports query parameters via the `params` option.
 *
 * @param {string} url - The request URL
 * @param {unknown} [data] - The request body data
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server
 *
 * @example
 * const response = await api.put('/users/1', { name: 'Jane' })
 */
const put = async (url: string, data?: unknown, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  return request(url, { ...config, method: 'put', data })
}

/**
 * Executes a DELETE request.
 * Supports query parameters via the `params` option.
 * Also supports request body via the `data` option if the API requires it.
 *
 * @param {string} url - The request URL
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server
 *
 * @example
 * const response = await api.delete('/users/1', { params: { cascade: true } })
 */
const deleteRequest = async (url: string, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  return request(url, { ...config, method: 'delete' })
}

/**
 * Executes a PATCH request.
 * Supports request body via the `data` option (JSON, FormData, or URLSearchParams).
 * Also supports query parameters via the `params` option.
 *
 * @param {string} url - The request URL
 * @param {unknown} [data] - The request body data
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server
 *
 * @example
 * const response = await api.patch('/users/1', { name: 'Jane' })
 */
const patch = async (url: string, data?: unknown, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  return request(url, { ...config, method: 'patch', data })
}

/**
 * Executes a HEAD request.
 * Supports query parameters via the `params` or `data` option.
 *
 * @param {string} url - The request URL
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server (no body)
 *
 * @example
 * const response = await api.head('/users/1')
 */
const head = async (url: string, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  return request(url, { ...config, method: 'head' })
}

/**
 * Executes an OPTIONS request.
 * Supports query parameters via the `params` option.
 *
 * @param {string} url - The request URL
 * @param {ApiRequestConfig} [config={}] - Additional request configuration
 * @returns {Promise<AxiosResponse>} The response from the server
 *
 * @example
 * const response = await api.options('/users')
 */
const options = async (url: string, config: ApiRequestConfig = {}): Promise<AxiosResponse> => {
  return request(url, { ...config, method: 'options' })
}

/**
 * API client object with methods for common HTTP operations.
 *
 * @example
 * import { api } from '@/services'
 *
 * const response = await api.get('/users')
 * const response = await api.post('/users', { name: 'John' })
 * const response = await api.put('/users/1', { name: 'Jane' })
 * const response = await api.delete('/users/1')
 * const response = await api.patch('/users/1', { name: 'Jane' })
 * const response = await api.head('/users/1')
 * const response = await api.options('/users')
 */
export const api = {
  request,
  buildRequest,
  get,
  post,
  put,
  delete: deleteRequest,
  patch,
  head,
  options,
}

export default api
export type { AxiosRequestConfig, AxiosResponse }

