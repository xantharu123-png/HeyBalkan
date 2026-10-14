'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

// Bei inhaltlichen Aenderungen von AGB/Datenschutz hochzaehlen
const LEGAL_VERSION = '2026-10-14';

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptSensitive, setAcceptSensitive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError(t('errorEmail')); return; }
    if (password.length < 6) { setError(t('errorPassword')); return; }
    if (password !== confirmPw) { setError(t('errorPasswordMatch')); return; }
    if (!acceptTerms) { setError(t('errorAcceptTerms')); return; }
    if (!acceptSensitive) { setError(t('errorAcceptSensitive')); return; }

    setLoading(true);
    setError('');

    const acceptedAt = new Date().toISOString();
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          terms_version: LEGAL_VERSION,
          terms_accepted_at: acceptedAt,
          sensitive_data_consent_at: acceptedAt,
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      router.push('/app/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-6xl mb-3">👋</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Hey Balkan!</h1>
          <p className="text-white/80 mt-2">{t('tagline')}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              autoComplete="email"
            />
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder={t('confirmPassword')}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              autoComplete="new-password"
            />

            <label className="flex items-start gap-3 text-sm text-white/85 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-white"
              />
              <span>
                {t('acceptTerms').split(/(\{terms\}|\{privacy\})/).map((part, i) => {
                  if (part === '{terms}') {
                    return <Link key={i} href="/agb" target="_blank" className="underline font-semibold">{t('terms')}</Link>;
                  }
                  if (part === '{privacy}') {
                    return <Link key={i} href="/datenschutz" target="_blank" className="underline font-semibold">{t('privacyPolicy')}</Link>;
                  }
                  return part;
                })}
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-white/85 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptSensitive}
                onChange={(e) => setAcceptSensitive(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-white"
              />
              <span>{t('acceptSensitive')}</span>
            </label>

            {error && (
              <p className="text-red-300 text-sm bg-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-indigo-600 font-bold py-3.5 rounded-xl hover:bg-white/90 transition disabled:opacity-60"
            >
              {loading ? '...' : t('signup')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-white/60 text-sm">{t('hasAccount')} </span>
            <Link href="/auth/login" className="text-white font-semibold text-sm hover:underline">
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
