import type { Metadata } from 'next';
import { Header, Footer } from '@/components/brand';
import { AnalyticsConsent, AnalyticsPageViews } from '@/components/analytics-consent';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://middagen-hverdag.andreas-swane.chatgpt.site'),
  title: { default: 'Hva skal vi ha til middag? | Middagen.no', template: '%s | Middagen.no' },
  description: 'Få tre konkrete middagstips med ett trykk. Velg etter tid, pris eller en ingrediens du har, og gå rett til en enkel oppskrift.',
  robots: { index: false, follow: false }, icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nb" data-scroll-behavior="smooth"><body><a className="skip-link" href="#hovedinnhold">Hopp til innhold</a><div className="site-shell"><Header/>{children}<Footer/></div><AnalyticsConsent/><AnalyticsPageViews/></body></html>;
}
