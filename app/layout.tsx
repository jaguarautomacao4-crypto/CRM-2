import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'EnterpriseCRM | Sales Intelligence',
  description: 'Enterprise CRM and Sales Intelligence Management System',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased text-slate-950 bg-slate-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
