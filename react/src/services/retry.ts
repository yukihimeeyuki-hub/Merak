import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Retrieves the maximum number of retry attempts from environment variables.
 * Falls back to 3 if not configured.
 *
 * @returns {number} The maximum number of retry attempts
 */
const getRetryCount = (): number => Number(import.meta.env.VITE_API_RETRY_COUNT) || 3

/**
 * Retrieves the delay duration between retries from environment variables.
 * Falls back to 1000ms (1 second) if not configured.
 *
 * @returns {number} The delay duration in milliseconds
 */
const getRetryDelay = (): number => Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000

/**
 * Creates a delay promise for retry intervals.
 *
 * @param {number} ms - The delay duration in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified delay
 */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Executes an Axios request with automatic retry logic on failure.
 * Retries the request if it fails due to network errors or 5xx server errors.
 *
 * @param {AxiosInstance} instance - The Axios instance to use for the request
 * @param {AxiosRequestConfig} config - The request configuration
 * @param {number} [retryCount=getRetryCount()] - The maximum number of retry attempts
 * @param {number} [retryDelay=getRetryDelay()] - The delay between retries in milliseconds
 * @returns {Promise<AxiosResponse>} The Axios response
 */
export const requestWithRetry = async (
  instance: AxiosInstance,
  config: AxiosRequestConfig,
  retryCount: number = getRetryCount(),
  retryDelay: number = getRetryDelay(),
): Promise<AxiosResponse> => {
  let lastError: unknown

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await instance.request(config)
    } catch (error: unknown) {
      lastError = error

      const isNetworkError = !(error as { response?: { status?: number } }).response
      const isServerError = (error as { response?: { status?: number } })?.response?.status !== undefined &&
        (error as { response: { status: number } }).response.status >= 500

      const shouldRetry = isNetworkError || isServerError

      if (!shouldRetry || attempt === retryCount) {
        throw error
      }

      await delay(retryDelay * (attempt + 1))
    }
  }

  throw lastError
}
