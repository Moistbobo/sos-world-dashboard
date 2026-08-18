import { useTranslation } from 'react-i18next';
import type { World } from '../../types';
import { useCurationMutation } from '../../hooks/useCuration';
import { getCurationState, type CurationAction } from '../../utils/curation';

interface WorldCurationActionsProps {
  world: World;
}

export function WorldCurationActions({ world }: WorldCurationActionsProps) {
  const { t } = useTranslation();
  const mutation = useCurationMutation();
  const state = getCurationState(world);
  const disabled = mutation.isPending;

  const fire = (action: CurationAction) => {
    mutation.mutate({ worldId: world.worldId, guildId: world.guildId, action });
  };

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {(state.kind === 'untagged' || state.kind === 'high-priority') && (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fire({ type: 'set-quality', quality: 'good' });
            }}
            className="relative z-30 rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('curator.markGood')}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fire({ type: 'set-quality', quality: 'bad' });
            }}
            className="relative z-30 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('curator.markBad')}
          </button>
        </>
      )}
      {state.kind === 'untagged' && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fire({ type: 'set-high-priority' });
          }}
            className="relative z-30 rounded-lg bg-amber-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('curator.markHighPriority')}
        </button>
      )}
      {state.kind === 'high-priority' && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fire({ type: 'clear-high-priority' });
          }}
          className="relative z-30 rounded-lg bg-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200"
        >
          {t('curator.clearStatus')}
        </button>
      )}
      {state.kind === 'quality-tagged' && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fire({ type: 'clear-quality' });
          }}
          className="relative z-30 rounded-lg bg-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200"
        >
          {t('curator.clearQuality')}
        </button>
      )}
    </div>
  );
}
