import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

const navLinks = [
  { to: '/', label: 'Дашборд' },
  { to: '/incomes', label: 'Доходы' },
  { to: '/expenses', label: 'Расходы' },
  { to: '/income-sources', label: 'Источники' },
  { to: '/categories', label: 'Категории' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-dark-900 text-dark-100">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-dark-800/80 backdrop-blur-xl border-b border-dark-600/50">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent tracking-tight">
            FinTrack
          </h1>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  location.pathname === link.to
                    ? 'px-3 py-1.5 rounded-lg text-sm font-medium bg-accent-500/15 text-accent-400 transition-all duration-200'
                    : 'px-3 py-1.5 rounded-lg text-sm font-medium text-dark-200 hover:text-dark-100 hover:bg-dark-700/60 transition-all duration-200'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-dark-300 hidden sm:inline">
                {user.displayName || user.email}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm font-medium text-dark-300 border border-dark-500 rounded-lg hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
              >
                Выйти
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-dark-400 border-t border-dark-700/50">
        FinTrack &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
