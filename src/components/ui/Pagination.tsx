import Link from "next/link";

/** Link-based pagination (crawlable, works without JS). `page` is zero-based like the API. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const linkClass =
    "inline-flex h-10 items-center rounded-full px-4 text-sm ring-1 ring-line transition-colors hover:bg-surface hover:ring-ink/30";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {page > 0 && (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      )}
      <span className="px-3 text-sm text-muted tabular-nums" aria-current="page">
        Page {page + 1} of {totalPages}
      </span>
      {page < totalPages - 1 && (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      )}
    </nav>
  );
}
