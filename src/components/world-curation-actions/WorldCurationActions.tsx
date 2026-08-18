import { useTranslation } from 'react-i18next';
import type { World } from '../../types';
import { useCurationMutation } from '../../hooks/useCuration';
import { getCurationState, type CurationAction } from '../../utils/curation';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

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
    <div className={stylex.props(styles.c2kmsej).className}>
      {state.kind !== 'quality-tagged' && (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fire({ type: 'set-quality', quality: 'good' });
            }}
            className={stylex.props(styles.cim9v6c).className}
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
            className={stylex.props(styles.c1lofpv8).className}
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
            className={stylex.props(styles.cbolkpg).className}
        >
          {t('curator.markHighPriority')}
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
          className={stylex.props(styles.c1eechsc).className}
        >
          {t('curator.clearQuality')}
        </button>
      )}
    </div>
  );
}

const styles = stylex.create({
  c2kmsej: {
    "marginTop": "0.75rem",
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "0.375rem",
  },
  cim9v6c: {
    "position": "relative",
    "zIndex": 30,
    "borderRadius": "0.5rem",
    "backgroundColor": "#15803d",
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": "#ffffff",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#166534",
    },
    ":disabled": {
      "cursor": "not-allowed",
      "opacity": 0.5,
    },
  },
  c1lofpv8: {
    "position": "relative",
    "zIndex": 30,
    "borderRadius": "0.5rem",
    "backgroundColor": "#dc2626",
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": "#ffffff",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#b91c1c",
    },
    ":disabled": {
      "cursor": "not-allowed",
      "opacity": 0.5,
    },
  },
  cbolkpg: {
    "position": "relative",
    "zIndex": 30,
    "borderRadius": "0.5rem",
    "backgroundColor": "#b45309",
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": "#ffffff",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#92400e",
    },
    ":disabled": {
      "cursor": "not-allowed",
      "opacity": 0.5,
    },
  },
  c1eechsc: {
    "position": "relative",
    "zIndex": 30,
    "borderRadius": "0.5rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-200"],
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "filter": "brightness(1.1)",
    },
    ":disabled": {
      "cursor": "not-allowed",
      "opacity": 0.5,
    },
  },
});
