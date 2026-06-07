import { useState, useEffect } from 'react';
import { Save, Activity, Globe, KeyRound, Check, AlertTriangle } from 'lucide-react';
import { getConfig, setConfig } from '../api/client';
import { fetchHealth } from '../api/client';

export function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const cfg = getConfig();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaseUrl(cfg.baseUrl);
     
    setToken(cfg.token);
  }, []);

  const handleSave = () => {
    setConfig({ baseUrl, token });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleTest = async () => {
    setTestStatus('loading');
    setTestMessage('');
    try {
      setConfig({ baseUrl, token });
      await fetchHealth();
      // also test an authed endpoint if token provided
      if (token) {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/worlds?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(res.statusText);
      }
      setTestStatus('ok');
      setTestMessage('Connection successful.');
    } catch (err) {
      setTestStatus('fail');
      setTestMessage(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure connection to the world tagger API.
        </p>
      </div>

      <div className="card p-5 space-y-5">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-200">
            <Globe className="h-4 w-4 text-slate-400" />
            API Base URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="input w-full"
          />
          <p className="mt-1 text-xs text-slate-500">The root URL of the bot_vrc_world_tagger API server.</p>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-200">
            <KeyRound className="h-4 w-4 text-slate-400" />
            Bearer Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="your-api-token"
            className="input w-full"
          />
          <p className="mt-1 text-xs text-slate-500">
            Required for all routes except /api/health. Set in the bot config.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={handleSave} className="btn-primary gap-2">
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleTest}
            disabled={testStatus === 'loading'}
            className="btn-secondary gap-2"
          >
            <Activity className="h-4 w-4" />
            {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
          </button>

          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>

        {testStatus !== 'idle' && testStatus !== 'loading' && (
          <div
            className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              testStatus === 'ok'
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-red-500/10 text-red-300'
            }`}
          >
            {testStatus === 'fail' && <AlertTriangle className="h-4 w-4" />}
            {testStatus === 'ok' && <Check className="h-4 w-4" />}
            {testMessage}
          </div>
        )}
      </div>
    </div>
  );
}
