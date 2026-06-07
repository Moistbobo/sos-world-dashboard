import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save, Activity, Globe, KeyRound, Check, AlertTriangle } from 'lucide-react';
import { getConfig, setConfig, fetchHealth } from '../api/client';

export function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState(() => getConfig().baseUrl);
  const [token, setToken] = useState(() => getConfig().token);
  const [saved, setSaved] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  const handleSave = () => {
    setConfig({ baseUrl, token });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const testConnection = useMutation({
    mutationFn: async () => {
      setConfig({ baseUrl, token });
      await fetchHealth();
      if (token) {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/worlds?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(res.statusText);
      }
    },
    onSuccess: () => {
      setTestMessage('Connection successful.');
    },
    onError: (err) => {
      setTestMessage(err instanceof Error ? err.message : 'Connection failed');
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure connection to the world tagger API.
        </p>
      </div>

      <div className="card p-5 space-y-5">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            API Base URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="input w-full"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">The root URL of the bot_vrc_world_tagger API server.</p>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <KeyRound className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Bearer Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="your-api-token"
            className="input w-full"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Required for all routes except /api/health. Set in the bot config.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={handleSave} className="btn-primary gap-2">
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={() => testConnection.mutate()}
            disabled={testConnection.isPending}
            className="btn-secondary gap-2"
          >
            <Activity className="h-4 w-4" />
            {testConnection.isPending ? 'Testing...' : 'Test Connection'}
          </button>

          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>

        {testConnection.isSuccess && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            <Check className="h-4 w-4" />
            {testMessage}
          </div>
        )}

        {testConnection.isError && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            {testMessage}
          </div>
        )}
      </div>
    </div>
  );
}
