export function getAppVersion(): string {
  const version = __APP_VERSION__ ?? '0.0.0';

  if (__APP_MODE__ === 'preview') {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    return `${version} — ${timestamp}`;
  }

  return version;
}
