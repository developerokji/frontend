import { useCallback, useEffect, useRef, useState } from 'react';
import { clearAuthData } from '../common/AuthGuard';

/**
 * Turn an axios error into something a section can render.
 * The apiClient interceptor rejects with the raw axios error.
 */
const describeError = (error) => {
  const status = error?.response?.status;
  if (status === 403) {
    return { status, message: 'You need an admin account to view this section.' };
  }
  if (!error?.response) {
    return { status: 0, message: 'Could not reach the server. Check your connection and try again.' };
  }
  return {
    status,
    message: error.response.data?.message || 'Something went wrong while loading this section.',
  };
};

const isAbort = (error) => error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';

/**
 * Fetch one dashboard section.
 *
 * `fetcher(config)` must accept an axios config (used for the abort signal).
 * `key` identifies the request; when it changes the section refetches and any
 * in-flight request is aborted, so fast toggling never shows stale results.
 * The previous data is kept while a new request loads.
 *
 * A 401 means the session is gone: auth data is cleared and the user is sent
 * to /login. A 403 is shown as a section-level "no access" error.
 */
export function useDashboardResource(fetcher, key) {
  const fetcherRef = useRef(fetcher);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ requestKey: null, data: null, error: null });

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const requestKey = `${key}#${attempt}`;

  useEffect(() => {
    const controller = new AbortController();

    fetcherRef
      .current({ signal: controller.signal })
      .then((data) => {
        setState({ requestKey, data, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || isAbort(error)) return;
        if (error?.response?.status === 401) {
          clearAuthData();
          return;
        }
        setState((prev) => ({ requestKey, data: prev.data, error: describeError(error) }));
      });

    return () => controller.abort();
  }, [requestKey]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    data: state.data,
    error: state.requestKey === requestKey ? state.error : null,
    loading: state.requestKey !== requestKey,
    retry,
  };
}
