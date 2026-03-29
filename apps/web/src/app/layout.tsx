import type { Metadata } from 'next';
import { Inter, Lora, Raleway } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
});

const raleway = Raleway({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-raleway',
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
    <html lang="pt-BR" className={`${inter.variable} ${lora.variable} ${raleway.variable}`}>
      <body className="min-h-screen font-raleway font-light bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
