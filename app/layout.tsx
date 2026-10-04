import type { Metadata } from 'next';
import { Header, Footer } from '@/components/brand';
import { AnalyticsConsent, AnalyticsPageViews } from '@/components/analytics-consent';
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/site';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Hva skal vi ha til middag? | Middagen.no', template: '%s | Middagen.no' },
  description: SITE_DESCRIPTION,
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nb" data-scroll-behavior="smooth"><body><a className="skip-link" href="#hovedinnhold">Hopp til innhold</a><div className="site-shell"><Header/>{children}<Footer/></div><AnalyticsConsent/><AnalyticsPageViews/></body></html>;
}
