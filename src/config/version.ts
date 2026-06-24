export function getAppVersion(): string {
  const version = __APP_VERSION__ ?? '0.0.0';
  const sha = __APP_GIT_SHA__ ?? 'unknown';
  return `${version} — ${sha}`;
}
