interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  onChangeOffset: (offset: number) => void;
}

export function Pagination({ offset, limit, total, onChangeOffset }: PaginationProps) {
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
    <div className="flex items-center gap-2">
      <button
        disabled={!canPrev}
        onClick={() => onChangeOffset(Math.max(0, offset - limit))}
        className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs"
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChangeOffset((p - 1) * limit)}
          className={`
            min-w-[2rem] rounded-lg px-2 py-1.5 text-xs font-medium transition
            ${p === currentPage
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}
          `}
        >
          {p}
        </button>
      ))}

      <button
        disabled={!canNext}
        onClick={() => onChangeOffset(offset + limit)}
        className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs"
      >
        Next
      </button>

      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
        {offset + 1} – {Math.min(offset + limit, total)} of {total}
      </span>
    </div>
  );
}
