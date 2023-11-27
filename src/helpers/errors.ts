import { AxiosError } from 'axios';
import { isNil } from 'lodash';

export enum ApiErrorCode {
  EXPIRED_ACCESS_TOKEN = 'EXPIRED_ACCESS_TOKEN',
  EXPIRED_REFRESH_TOKEN = 'EXPIRED_REFRESH_TOKEN',
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  statusCode: number;
}

export enum AppErrorCode {
  DISCONNECTED = 'DISCONNECTED', // when user is logged out
  CANCELED = 'ERR_CANCELED', // error code when cancelling Axios requests
}

export interface AppError extends Error {
  code: AppErrorCode;
}

export type AnyError = AppError | AxiosError<ApiError> | Error;

/**
 * Silence some errors that don't need to be handled in the UI.
 */
export const handleSilentError = async (error: AnyError): Promise<void> => {
  if (
    [AppErrorCode.DISCONNECTED, AppErrorCode.CANCELED].includes((error as AppError)?.code) ||
    [ApiErrorCode.EXPIRED_ACCESS_TOKEN].includes(
      ((error as AxiosError).response?.data as ApiError)?.code,
    )
  ) {
    return Promise.resolve();
  }
  return Promise.reject(error);
};

/**
 * Extract error message from any error.
 */
export const parseErrorText = async (error: AnyError): Promise<string> => {
  const contentType = (error as AxiosError).response?.headers?.['content-type'] as string;
  const contentLength = (error as AxiosError).response?.headers?.['content-length'] as string;
  const hasContent = isNil(contentLength) || parseInt(contentLength, 10) > 0;
  const isBodyJson = hasContent && contentType?.includes('json');
  if (hasContent) {
    const content = (error as AxiosError).response?.data as any;
    const isParseable = typeof content?.text === 'function';
    if (isParseable && isBodyJson) {
      const isEmpty = !content?.size;
      if (!isEmpty) {
        const parsedError = JSON.parse(await content.text());
        return parsedError.message || parsedError.error;
      }
      return error.message;
    }
    if (content) {
      return typeof content !== 'string' ? content.message : content;
    }
  }
  return error.message;
};

export const scrollToFirstError = () => {
  const firstErrorElement = document.querySelector('[aria-invalid="true"]');
  if (firstErrorElement) {
    firstErrorElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
};
