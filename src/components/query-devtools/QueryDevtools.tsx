import { lazy } from 'react';

const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
);

export function QueryDevtools() {
  return <ReactQueryDevtools initialIsOpen={false} />;
}
