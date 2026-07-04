import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileChallengeProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
}

export function TurnstileChallenge({ siteKey, onVerify, onError }: TurnstileChallengeProps) {
  return (
    <div className="flex justify-center py-4" data-testid="turnstile-challenge">
      <Turnstile siteKey={siteKey} onSuccess={onVerify} onError={onError} />
    </div>
  );
}
