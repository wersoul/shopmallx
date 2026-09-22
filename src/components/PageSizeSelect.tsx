'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Props = {
  /** Current page size so the dropdown can show the active option. */
  current: number;
};

/**
 * Tiny client component that auto-submits when the visitor picks a new
 * page size from the dropdown. Lives outside <Pagination/> so the parent
 * can stay a Server Component (no event handlers).
 */
export default function PageSizeSelect({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('perPage', e.currentTarget.value);
    next.set('page', '1');
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      id="perPage-select"
      name="perPage"
      defaultValue={String(current)}
      onChange={handleChange}
      className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
      aria-label="จำนวนสินค้าต่อหน้า"
    >
      <option value="25">25</option>
      <option value="50">50</option>
    </select>
  );
}