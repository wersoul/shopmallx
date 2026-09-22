import Link from 'next/link';
import PageSizeSelect from './PageSizeSelect';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
  allowPageSizeSwitch?: boolean;
};

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  basePath,
  extraParams = {},
  allowPageSizeSwitch = true
}: PaginationProps) {
  if (totalPages <= 1 && !allowPageSizeSwitch) return null;

  function pageHref(page: number, size: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== '') params.set(k, v);
    }
    params.set('page', String(page));
    params.set('perPage', String(size));
    return basePath + '?' + params.toString();
  }

  const pageSet = new Set<number>();
  pageSet.add(1);
  pageSet.add(totalPages);
  for (let p = currentPage - 2; p <= currentPage + 2; p++) {
    if (p >= 1 && p <= totalPages) pageSet.add(p);
  }
  const pages = Array.from(pageSet).sort((a, b) => a - b);

  const items: (number | 'ellipsis')[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) items.push('ellipsis');
    items.push(pages[i]);
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4"
    >
      <div className="text-sm text-gray-600">
        ทั้งหมด{' '}
        <span className="font-semibold text-gray-800">
          {totalItems.toLocaleString('th-TH')}
        </span>{' '}
        รายการ · หน้า{' '}
        <span className="font-semibold text-gray-800">{currentPage}</span> /{' '}
        {totalPages}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {allowPageSizeSwitch && (
          <div className="flex items-center gap-1 text-sm">
            <label htmlFor="perPage-select" className="text-gray-600">
              แสดง
            </label>
            <PageSizeSelect current={pageSize} />
            <span className="text-gray-600">ต่อหน้า</span>
          </div>
        )}

        {hasPrev ? (
          <Link
            href={pageHref(currentPage - 1, pageSize)}
            aria-label="หน้าก่อนหน้า"
            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-brand-50 hover:border-brand-400 text-sm"
          >
            ‹ ก่อนหน้า
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed">
            ‹ ก่อนหน้า
          </span>
        )}

        {items.map((it, idx) =>
          it === 'ellipsis' ? (
            <span
              key={'e-' + idx}
              className="px-2 py-1.5 text-gray-400 text-sm select-none"
              aria-hidden="true"
            >
              …
            </span>
          ) : it === currentPage ? (
            <span
              key={it}
              aria-current="page"
              className="px-3 py-1.5 rounded border border-brand-600 bg-brand-600 text-white text-sm font-semibold min-w-[2.25rem] text-center"
            >
              {it}
            </span>
          ) : (
            <Link
              key={it}
              href={pageHref(it, pageSize)}
              aria-label={'ไปหน้า ' + it}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-brand-50 hover:border-brand-400 text-sm min-w-[2.25rem] text-center"
            >
              {it}
            </Link>
          )
        )}

        {hasNext ? (
          <Link
            href={pageHref(currentPage + 1, pageSize)}
            aria-label="หน้าถัดไป"
            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-brand-50 hover:border-brand-400 text-sm"
          >
            ถัดไป ›
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed">
            ถัดไป ›
          </span>
        )}
      </div>
    </nav>
  );
}