'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Bell, HelpCircle, MessageSquare, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { COUNTRIES, APP_LANGUAGES } from '@/lib/constants';
import type { Locale } from '@/i18n/translations';

interface Profile {
  first_name: string;
  birth_date: string;
  origin_country: string;
  city: string;
  bio: string | null;
  photos: string[];
  spoken_languages: string[];
  relationship_goal: string;
  religion: string | null;
}

function getAge(bd: string) {
  const b = new Date(bd);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleLogout = async () => {
    if (confirm(t('logout') + '?')) {
      await supabase.auth.signOut();
      router.replace('/auth/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  const country = COUNTRIES.find(c => c.code === profile.origin_country);
  const age = getAge(profile.birth_date);
  const photo = profile.photos?.[0];

  return (
    <div className="max-w-lg mx-auto">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 pt-10 pb-8 px-6 text-center">
        {photo ? (
          <img src={photo} alt="" className="w-24 h-24 rounded-full border-3 border-white mx-auto object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <span className="text-4xl">👤</span>
          </div>
        )}
        <h2 className="text-2xl font-extrabold text-white mt-3">
          {profile.first_name}, {age}
        </h2>
        {country && (
          <p className="text-white/90 mt-1">{country.flag} {country.name}</p>
        )}
        {profile.city && (
          <p className="text-white/70 text-sm">📍 {profile.city}</p>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="px-6 py-5 border-b border-slate-800">
          <h3 className="text-white font-semibold mb-2">{t('writeBio')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Info */}
      <div className="px-6 py-5 border-b border-slate-800 space-y-3">
        <h3 className="text-white font-semibold">Info</h3>
        {profile.spoken_languages?.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare size={16} className="text-slate-400" />
            <span className="text-slate-300">{profile.spoken_languages.join(', ')}</span>
          </div>
        )}
        {profile.relationship_goal && (
          <div className="flex items-center gap-2 text-sm">
            <Heart size={16} className="text-slate-400" />
            <span className="text-slate-300">{t(profile.relationship_goal) || profile.relationship_goal}</span>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h3 className="text-white font-semibold mb-3">{t('language')}</h3>
        <div className="flex flex-wrap gap-2">
          {APP_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Locale)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                language === lang.code
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h3 className="text-white font-semibold mb-3">{t('settings')}</h3>
        {[
          { icon: Bell, label: t('notifications') },
          { icon: Shield, label: t('privacy') },
          { icon: HelpCircle, label: t('help') },
        ].map((item, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3 py-3 text-slate-300 hover:text-white transition border-b border-slate-800 last:border-0"
          >
            <item.icon size={18} />
            <span className="flex-1 text-left">{item.label}</span>
            <span className="text-slate-600">›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 py-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition font-semibold"
        >
          <LogOut size={18} />
          {t('logout')}
        </button>
        <p className="text-slate-600 text-xs mt-4">Version 1.0.0</p>
      </div>

      <div className="h-20" />
    </div>
  );
}
