import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Mucunã • Ecossistema de Habilitação Institucional',
  description: 'Sistema oficial de gestão de documentação e convocação da UEFS. Segurança bio-social e transparência processual com interface Organic Security.',
  keywords: ['UEFS', 'Mucunã', 'Habilitação', 'Concursos', 'Documentação', 'Segurança'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
