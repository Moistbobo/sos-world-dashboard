const REPORT_FIELDS = [
  'document-uri',
  'blocked-uri',
  'violated-directive',
  'effective-directive',
  'source-file',
  'line-number',
] as const;

const MAX_BODY_BYTES = 64 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractReport(body: unknown, contentType: string | null): Record<string, unknown> | null {
  if (contentType === 'application/reports+json') {
    const entries = Array.isArray(body) ? body : [body];
    const entry = entries.find(
      (item) => isRecord(item) && item.type === 'csp-violation' && isRecord(item.body)
    );
    return entry ? entry.body : null;
  }
  if (!isRecord(body)) return null;
  if (contentType === 'application/csp-report' && isRecord(body['csp-report'])) {
    return body['csp-report'];
  }
  if (contentType === 'application/json') {
    return REPORT_FIELDS.some((field) => field in body) ? body : null;
  }
  return null;
}

export function handleCspReport(body: unknown, contentType: string | null): string | null {
  const report = extractReport(body, contentType);
  if (!report) return null;
  const entry: Record<string, string | number> = {};
  for (const field of REPORT_FIELDS) {
    const value = report[field];
    if (typeof value === 'string' || typeof value === 'number') entry[field] = value;
  }
  return JSON.stringify(entry);
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  const contentType = request.headers.get('content-type')?.split(';')[0].trim() ?? null;
  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_BYTES) {
    return new Response(null, { status: 400 });
  }
  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return new Response(null, { status: 400 });
  }
  const logLine = handleCspReport(body, contentType);
  if (logLine === null) {
    return new Response(null, { status: 400 });
  }
  console.log('CSP-VIOLATION ' + logLine);
  return new Response(null, { status: 204 });
}
