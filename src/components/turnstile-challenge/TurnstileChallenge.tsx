import { Turnstile } from '@marsidev/react-turnstile';
import * as stylex from '@stylexjs/stylex';

interface TurnstileChallengeProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
}

export function TurnstileChallenge({ siteKey, onVerify, onError }: TurnstileChallengeProps) {
  return (
    <div className={stylex.props(styles.cs6jd9z).className} data-testid="turnstile-challenge">
      <Turnstile siteKey={siteKey} onSuccess={onVerify} onError={onError} />
    </div>
  );
}

const styles = stylex.create({
  cs6jd9z: {
    "display": "flex",
    "justifyContent": "center",
    "paddingTop": "1rem",
    "paddingBottom": "1rem",
  },
});
