import { useEffect, useRef } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useHealth } from './useApi';

const DEFAULT_RETRY = 3;

export function useApiDownToast() {
  const { isError } = useHealth();
  const { t } = useTranslation();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (isError && !hasShownRef.current) {
      hasShownRef.current = true;
      toast.warning(t('api.toast.unreachable'));
    }
    if (!isError) {
      hasShownRef.current = false;
    }
  }, [isError, t]);
}

type SuppressibleOptions = { suppressErrorToast?: boolean };

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

function isFinalFailure<TError>(
  isError: boolean,
  failureCount: number,
  retry: UseQueryOptions<unknown, TError>['retry'],
): boolean {
  if (!isError) return false;
  if (retry === false) return true;
  if (typeof retry === 'number') return failureCount > retry;
  if (retry === true) return false;
  return failureCount > DEFAULT_RETRY;
}

function useFinalErrorToast(
  error: unknown,
  enabled: boolean,
  isFinal: boolean,
  fallbackMessage: string,
) {
  const lastErrorRef = useRef<unknown>(undefined);
  const lastShownForError = useRef<unknown>(undefined);

  useEffect(() => {
    if (!enabled) {
      lastErrorRef.current = undefined;
      lastShownForError.current = undefined;
      return;
    }

    if (error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      lastShownForError.current = undefined;
    }

    if (isFinal && error && lastShownForError.current !== error) {
      lastShownForError.current = error;
      toast.error(getErrorMessage(error, fallbackMessage));
    }
  }, [error, enabled, isFinal, fallbackMessage]);
}

export function useApiQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, TError, TData> & SuppressibleOptions,
): UseQueryResult<TData, TError> {
  const { suppressErrorToast, ...rest } = options;
  const result = useQuery(rest);

  useFinalErrorToast(
    result.error,
    !suppressErrorToast,
    isFinalFailure(result.isError, result.failureCount, rest.retry),
    'Request failed',
  );

  return result;
}

export function useApiInfiniteQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = InfiniteData<TQueryFnData, unknown>,
  TQueryKey extends readonly unknown[] = readonly unknown[],
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & SuppressibleOptions,
): UseInfiniteQueryResult<TData, TError> {
  const { suppressErrorToast, ...rest } = options;
  const result = useInfiniteQuery(rest);

  useFinalErrorToast(
    result.error,
    !suppressErrorToast,
    isFinalFailure(result.isError, result.failureCount, rest.retry),
    'Request failed',
  );

  return result;
}

export function useApiMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & SuppressibleOptions,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { suppressErrorToast, ...rest } = options;
  const result = useMutation(rest);

  useFinalErrorToast(
    result.error,
    !suppressErrorToast,
    result.isError,
    'Action failed',
  );

  return result;
}
