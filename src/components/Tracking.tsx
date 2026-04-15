'use client';
import { useEffect } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Tracking() {
  useEffect(() => {
    if (!GA_ID) return;
    // Load GA4
    const s = document.createElement('script');
    s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });

    // Scroll depth tracking (25/50/75/100)
    const thresholds = [25, 50, 75, 100];
    const fired = new Set<number>();
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100);
      for (const t of thresholds) {
        if (scrolled >= t && !fired.has(t)) {
          fired.add(t);
          gtag('event', 'scroll_depth', { percent: t });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Time on page (after 30s, 60s, 120s)
    const timeouts: number[] = [30, 60, 120].map(sec => window.setTimeout(() => gtag('event', 'engagement_time', { seconds: sec }), sec * 1000));
    return () => { window.removeEventListener('scroll', onScroll); timeouts.forEach(clearTimeout); };
  }, []);
  return null;
}
