declare const __APP_VERSION__: string;
declare const __APP_MODE__: string;
declare const __APP_GIT_SHA__: string;

interface Window {
  __benchmarkProfiles: {
    id: string;
    phase: 'mount' | 'update' | 'nested-update';
    actualDuration: number;
    baseDuration: number;
    startTime: number;
    commitTime: number;
  }[];
}
