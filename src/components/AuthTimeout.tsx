'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Inactivity auto-logout.
 *
 * Cookie / JWT lifetimes are 30 minutes (see /lib/auth.ts). This component
 * tracks user activity on the page and triggers a logout when the user has
 * been idle for `TIMEOUT_MS`. To avoid surprising people we show a countdown
 * modal `WARN_MS` before the actual logout.
 *
 * Activities that reset the timer: mousemove, mousedown, keydown, touchstart,
 * scroll, wheel, visibilitychange (back to visible).
 *
 * Mount this on every page where the user is logged in.
 */
const TIMEOUT_MS = 30 * 60 * 1000;     // 30 minutes
const WARN_MS = 60 * 1000;             // show warning 60s before logout

export default function AuthTimeout({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const lastActivity = useRef<number>(Date.now());
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  // Reset on user activity
  useEffect(() => {
    if (!loggedIn) return;
    const reset = () => { lastActivity.current = Date.now(); setShowWarning(false); };
    const events: (keyof DocumentEventMap)[] = [
      'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'
    ];
    events.forEach(e => document.addEventListener(e, reset, { passive: true }));
    document.addEventListener('visibilitychange', reset);
    return () => {
      events.forEach(e => document.removeEventListener(e, reset));
      document.removeEventListener('visibilitychange', reset);
    };
  }, [loggedIn]);

  // Tick once a second
  useEffect(() => {
    if (!loggedIn) return;
    const id = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      const remaining = Math.max(0, TIMEOUT_MS - idle);
      setSecondsLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        doLogout();
      } else if (remaining <= WARN_MS) {
        setShowWarning(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [loggedIn]);

  // Server-side cookie can still expire while the tab is open — poll /api/auth/me
  // every minute and bail out if the user is no longer authenticated.
  useEffect(() => {
    if (!loggedIn) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json() as any;
        if (!data?.user) doLogout();
      } catch {}
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [loggedIn]);

  const doLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    try {
      // notify other tabs
      localStorage.setItem('shopmallx_logout_at', String(Date.now()));
    } catch {}
    router.replace('/login?reason=timeout');
  };

  const stay = () => {
    lastActivity.current = Date.now();
    setShowWarning(false);
  };

  if (!loggedIn) return null;

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="alertdialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5">
            <div className="text-2xl mb-2">⏰</div>
            <h3 className="font-bold text-lg mb-2">กำลังจะออกจากระบบอัตโนมัติ</h3>
            <p className="text-sm text-gray-600 mb-4">
              คุณไม่มีการเคลื่อนไหวในเว็บไซต์เป็นเวลานาน ระบบจะออกจากระบบในอีก <b>{secondsLeft}</b> วินาที
              เพื่อความปลอดภัยของบัญชีคุณ
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={doLogout}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                ออกจากระบบเลย
              </button>
              <button
                onClick={stay}
                className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold"
              >
                ยังอยู่ต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}