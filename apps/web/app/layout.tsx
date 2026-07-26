import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lapidare',
  description: 'Todo campeão já foi um diamante bruto.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
