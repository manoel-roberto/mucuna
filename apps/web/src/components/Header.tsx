import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-green-700 text-white shadow-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          Mucunã UEFS
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/login" className="hover:text-green-200 transition-colors hidden md:block">Sou Candidato</Link>
          <Link href="/funcionario/login" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl transition-all shadow-lg border border-green-500/50">Área Restrita</Link>
        </nav>
      </div>
    </header>
  );
}
