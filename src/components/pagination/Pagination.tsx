import { useTranslation } from 'react-i18next';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  onChangeOffset: (offset: number) => void;
}

export function Pagination({ offset, limit, total, onChangeOffset }: PaginationProps) {
  const { t } = useTranslation();
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const pages = (() => {
    const arr: number[] = [];
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  })();

  return (
    <div className={stylex.props(styles.c2ca09w).className}>
      <button
        disabled={!canPrev}
        onClick={() => onChangeOffset(Math.max(0, offset - limit))}
        className={stylex.props(shared.btnSecondary, styles.c1w21h5a).className}
      >
        {t('pagination.prev')}
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChangeOffset((p - 1) * limit)}
          className={stylex.props(
            styles.pageBtn,
            p === currentPage ? styles.pageActive : styles.pageInactive,
          ).className}
        >
          {p}
        </button>
      ))}

      <button
        disabled={!canNext}
        onClick={() => onChangeOffset(offset + limit)}
        className={stylex.props(shared.btnSecondary, styles.c1w21h5a).className}
      >
        {t('pagination.next')}
      </button>

      <span className={stylex.props(styles.c1wz43hi).className}>
        {t('pagination.range', {
          start: offset + 1,
          end: Math.min(offset + limit, total),
          total,
        })}
      </span>
    </div>
  );
}

const styles = stylex.create({
  c2ca09w: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
  },
  c1w21h5a: {
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    ":disabled": {
      "cursor": "not-allowed",
    },
  },
  c1wz43hi: {
    "marginLeft": "0.5rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  pageBtn: {
    "minWidth": "2.75rem",
    "borderRadius": "0.5rem",
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  pageActive: {
    "backgroundColor": "#4f46e5",
    "color": "#ffffff",
  },
  pageInactive: {
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
    "color": colors["--sos-text-slate-700-slate-300"],
    ":hover": {
      "backgroundColor": "#cbd5e1",
    },
  },
});
