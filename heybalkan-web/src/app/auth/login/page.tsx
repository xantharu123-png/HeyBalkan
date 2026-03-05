'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { APP_LANGUAGES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError(t('errorEmail')); return; }
    if (password.length < 6) { setError(t('errorPassword')); return; }

    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      router.push('/app/discover');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 px-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 flex gap-1">
        {APP_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              language === lang.code
                ? 'bg-white text-indigo-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {lang.flag}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-6xl mb-3">👋</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Hey Balkan!</h1>
          <p className="text-white/80 mt-2">{t('tagline')}</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                autoComplete="email"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm bg-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-indigo-600 font-bold py-3.5 rounded-xl hover:bg-white/90 transition disabled:opacity-60"
            >
              {loading ? '...' : t('login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-white/60 text-sm">{t('noAccount')} </span>
            <Link href="/auth/signup" className="text-white font-semibold text-sm hover:underline">
              {t('signup')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
