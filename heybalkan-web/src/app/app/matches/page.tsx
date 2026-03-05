'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { COUNTRIES } from '@/lib/constants';

interface MatchUser {
  matchId: number;
  id: string;
  first_name: string;
  birth_date: string;
  origin_country: string;
  photos: string[];
}

function getAge(bd: string) {
  const b = new Date(bd);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export default function MatchesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;

      const { data } = await supabase
        .from('matches')
        .select(`
          id, user1_id, user2_id, created_at,
          user1:profiles!matches_user1_id_fkey(id, first_name, photos, origin_country, birth_date),
          user2:profiles!matches_user2_id_fkey(id, first_name, photos, origin_country, birth_date)
        `)
        .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
        .order('created_at', { ascending: false });

      const list = (data || []).map((m: any) => {
        const other = m.user1_id === uid ? m.user2 : m.user1;
        return { matchId: m.id, ...other };
      });

      setMatches(list);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-extrabold text-white">{t('matches')}</h1>
        <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          {matches.length}
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">💜</p>
          <h2 className="text-xl font-bold text-white mb-2">{t('noMatches')}</h2>
          <p className="text-slate-400">{t('noMatchesHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {matches.map(m => {
            const photo = m.photos?.[0];
            const age = getAge(m.birth_date);
            const country = COUNTRIES.find(c => c.code === m.origin_country);
            return (
              <button
                key={m.matchId}
                onClick={() => router.push(`/app/chat/${m.matchId}?name=${m.first_name}`)}
                className="bg-slate-800 rounded-2xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition text-left"
              >
                {photo ? (
                  <img src={photo} alt={m.first_name} className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-sky-500/30 to-purple-700/30 flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-white">{m.first_name}, {age}</p>
                  {country && <p className="text-sm text-slate-400">{country.flag} {country.name}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
