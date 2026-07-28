import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName || undefined);
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Ошибка регистрации');
      } else {
        setError('Не удалось подключиться к серверу');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-dark-800 border border-dark-600/50 rounded-2xl shadow-2xl shadow-black/30 p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2">
              FinTrack
            </h1>
            <p className="text-dark-300 text-sm">Создание аккаунта</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                Имя <span className="text-dark-400">(необязательно)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 placeholder-dark-400 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                placeholder="Ваше имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 placeholder-dark-400 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                Пароль <span className="text-dark-400">(минимум 8 символов)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 placeholder-dark-400 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-slide-down">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Регистрация...
                </span>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-300">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              className="text-accent-400 hover:text-accent-500 font-medium transition-colors duration-200"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
