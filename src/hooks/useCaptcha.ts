import { useCallback, useRef, useState } from 'react';

const CANCELLED_ERROR = new Error('Captcha challenge was cancelled');

interface UseCaptchaResult {
  isRequired: boolean;
  challengeKey: number;
  requestToken: () => Promise<string>;
  onVerify: (token: string) => void;
  onError: () => void;
  reset: () => void;
}

export function useCaptcha(): UseCaptchaResult {
  const [isRequired, setIsRequired] = useState(false);
  const [challengeKey, setChallengeKey] = useState(0);
  const resolveRef = useRef<((token: string) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  const requestToken = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;
      setChallengeKey((k) => k + 1);
      setIsRequired(true);
    });
  }, []);

  const onVerify = useCallback(
    (token: string) => {
      setIsRequired(false);
      resolveRef.current?.(token);
      resolveRef.current = null;
      rejectRef.current = null;
    },
    [setIsRequired],
  );

  const onError = useCallback(() => {
    setIsRequired(false);
    rejectRef.current?.(CANCELLED_ERROR);
    resolveRef.current = null;
    rejectRef.current = null;
  }, [setIsRequired]);

  const reset = useCallback(() => {
    setIsRequired(false);
    resolveRef.current = null;
    rejectRef.current = null;
  }, []);

  return {
    isRequired,
    challengeKey,
    requestToken,
    onVerify,
    onError,
    reset,
  };
}
