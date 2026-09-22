'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

type Cat = { id: string; name: string; slug: string; parentId?: string | null };

/**
 * Collapsible category sidebar for /products.
 *
 * Behaviour:
 *  - each parent with sub-categories can be expanded/collapsed via the chevron
 *  - the parent whose slug matches `searchCategory` is auto-expanded on first render
 *  - parents without sub-categories stay as a single link
 *  - the "ทั้งหมด" link is highlighted when neither `searchCategory` nor `searchSub` is set
 */
export default function CategorySidebar({
  parents,
  childrenByParent,
  activeCategoryId,
  activeSubId,
  searchCategory,
  searchSub
}: {
  parents: Cat[];
  childrenByParent: Record<string, Cat[]>;
  activeCategoryId: string | null;
  activeSubId: string | null;
  searchCategory?: string;
  searchSub?: string;
}) {
  // Build an initial map: anything that should be auto-expanded starts open.
  const initialExpanded: Record<string, boolean> = {};
  for (const p of parents) {
    const subs = childrenByParent[p.id] || [];
    if (subs.length === 0) continue;
    const shouldOpen =
      activeCategoryId === p.id || // currently filtering by this parent
      (!activeSubId && activeCategoryId === p.id); // already a parent filter
    initialExpanded[p.id] = !!shouldOpen;
  }
  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded);

  // Keep the active parent open whenever the URL changes — without this,
  // clicking a parent link would briefly collapse it before navigation.
  useEffect(() => {
    setExpanded(prev => {
      const next = { ...prev };
      for (const p of parents) {
        const subs = childrenByParent[p.id] || [];
        if (subs.length === 0) continue;
        if (activeCategoryId === p.id) next[p.id] = true;
      }
      return next;
    });
  }, [activeCategoryId, parents, childrenByParent]);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const linkFor = (parentSlug: string, subSlug?: string) => {
    const sp = new URLSearchParams();
    sp.set('category', parentSlug);
    if (subSlug) sp.set('subcategory', subSlug);
    return `/products?${sp.toString()}`;
  };

  const isActiveParent = (p: Cat) => activeCategoryId === p.id && !activeSubId;
  const isActiveSub = (s: Cat) =>
    activeSubId === s.id ||
    // legacy: when only ?category=<sub> is set
    (!activeSubId && activeCategoryId === s.id);

  const noFilter = !searchCategory && !searchSub;

  return (
    <aside className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-card p-4 sticky top-32">
        <h3 className="font-bold mb-3 text-gray-800">หมวดหมู่</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href="/products"
              className={`block py-1.5 px-2 rounded ${noFilter ? 'bg-brand-50 text-brand-600 font-semibold' : 'hover:bg-gray-50'}`}
            >
              ทั้งหมด
            </Link>
          </li>
          {parents.map(p => {
            const subs = childrenByParent[p.id] || [];
            const hasSubs = subs.length > 0;
            const open = hasSubs ? expanded[p.id] !== false : false; // parents with no sub are never "expanded"
            return (
              <li key={p.id}>
                <div className="flex items-center">
                  <Link
                    href={linkFor(p.slug)}
                    className={`flex-1 block py-1.5 px-2 rounded ${isActiveParent(p) ? 'bg-brand-50 text-brand-600 font-semibold' : 'hover:bg-gray-50'}`}
                  >
                    {p.name}
                  </Link>
                  {hasSubs && (
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      aria-label={open ? 'ย่อ' : 'ขยาย'}
                      aria-expanded={!!open}
                      className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-50 rounded"
                    >
                      {open ? <FiChevronDown /> : <FiChevronRight />}
                    </button>
                  )}
                </div>
                {hasSubs && open && (
                  <ul className="ml-3 mt-1 border-l border-gray-200 pl-2 space-y-1">
                    <li>
                      <Link
                        href={linkFor(p.slug)}
                        className={`block py-1 px-2 rounded text-xs ${isActiveParent(p) ? 'text-brand-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        ทั้งหมดใน{p.name}
                      </Link>
                    </li>
                    {subs.map(s => (
                      <li key={s.id}>
                        <Link
                          href={linkFor(p.slug, s.slug)}
                          className={`block py-1 px-2 rounded text-xs ${isActiveSub(s) ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}