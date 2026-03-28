import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UEFS Mucunã - Documentação Acadêmica',
  description: 'Sistema de Gestão de Documentações da UEFS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
