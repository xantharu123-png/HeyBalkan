'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { COUNTRIES } from '@/lib/constants';

interface Profile {
  id: string;
  first_name: string;
  birth_date: string;
  origin_country: string;
  city: string;
  bio: string | null;
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

function getFlag(code: string) {
  return COUNTRIES.find(c => c.code === code);
}

export default function DiscoverPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showMatch, setShowMatch] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string>('');

  const loadProfiles = useCallback(async (uid: string) => {
    const { data: swipedIds } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', uid);

    const exclude = [uid, ...(swipedIds?.map(s => s.swiped_id) || [])];

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${exclude.join(',')})`)
      .eq('onboarding_complete', true)
      .limit(20);

    setProfiles(data || []);
    setCurrentIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        loadProfiles(session.user.id);
      }
    });
  }, [loadProfiles]);

  const handleSwipe = async (action: 'like' | 'pass' | 'super_like') => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    setSwipeDirection(action === 'pass' ? 'left' : 'right');

    // Insert swipe
    await supabase.from('swipes').insert({
      swiper_id: userId,
      swiped_id: profile.id,
      action,
    });

    // Check for match
    if (action === 'like' || action === 'super_like') {
      const { data: reverse } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', profile.id)
        .eq('swiped_id', userId)
        .in('action', ['like', 'super_like'])
        .single();

      if (reverse) {
        // Create match
        const u1 = userId < profile.id ? userId : profile.id;
        const u2 = userId < profile.id ? profile.id : userId;
        await supabase.from('matches').insert({ user1_id: u1, user2_id: u2 });
        setShowMatch(profile);
      }
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const currentProfile = profiles[currentIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center px-8">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-2xl font-bold text-white mb-2">{t('noMoreProfiles')}</h2>
          <p className="text-slate-400 mb-6">{t('checkBackLater')}</p>
          <button
            onClick={() => { setLoading(true); loadProfiles(userId); }}
            className="flex items-center gap-2 mx-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition"
          >
            <RotateCcw size={18} /> Refresh
          </button>
        </div>
      </div>
    );
  }

  const age = getAge(currentProfile.birth_date);
  const country = getFlag(currentProfile.origin_country);
  const photo = currentProfile.photos?.[0];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <h1 className="text-2xl font-extrabold text-white mb-4">👋 Hey Balkan!</h1>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProfile.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{
            x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
            rotate: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0,
            opacity: 0,
          }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl overflow-hidden bg-slate-800 shadow-2xl"
          style={{ aspectRatio: '3/4', maxHeight: '65vh' }}
        >
          {/* Photo or Gradient */}
          {photo ? (
            <img src={photo} alt={currentProfile.first_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 flex items-center justify-center">
              <span className="text-8xl">👤</span>
            </div>
          )}

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
            <h2 className="text-3xl font-extrabold text-white">
              {currentProfile.first_name}, {age}
            </h2>
            {country && (
              <p className="text-white/90 text-lg mt-1">{country.flag} {country.name}</p>
            )}
            {currentProfile.city && (
              <p className="text-white/70 text-sm mt-1">📍 {currentProfile.city}</p>
            )}
            {currentProfile.bio && (
              <p className="text-white/60 text-sm mt-2 line-clamp-2">{currentProfile.bio}</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-5 mt-6">
        <button
          onClick={() => handleSwipe('pass')}
          className="w-16 h-16 rounded-full bg-slate-800 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition active:scale-90"
        >
          <X size={28} className="text-red-500" />
        </button>

        <button
          onClick={() => handleSwipe('super_like')}
          className="w-12 h-12 rounded-full bg-slate-800 border-2 border-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition active:scale-90"
        >
          <Star size={22} className="text-blue-500" />
        </button>

        <button
          onClick={() => handleSwipe('like')}
          className="w-16 h-16 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center hover:bg-green-500/20 transition active:scale-90"
        >
          <Heart size={28} className="text-green-500" />
        </button>
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 rounded-3xl p-8 text-center max-w-sm w-full"
            >
              <p className="text-6xl mb-4">🎉</p>
              <h2 className="text-3xl font-extrabold text-white mb-2">{t('itsAMatch')}</h2>
              <p className="text-white/80 mb-6">{t('matchMessage')}</p>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💜</span>
              </div>
              <button
                onClick={() => { setShowMatch(null); router.push('/app/chat'); }}
                className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl mb-3 hover:bg-white/90 transition"
              >
                {t('sendMessage')}
              </button>
              <button
                onClick={() => setShowMatch(null)}
                className="text-white/60 text-sm hover:text-white/80 transition"
              >
                {t('keepSwiping')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
