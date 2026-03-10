'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, SkipForward, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { COUNTRIES } from '@/lib/constants';
import { useParams } from 'next/navigation';

// Use the anon client (no auth needed)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FamilyMember {
  id: string;
  owner_id: string;
  name: string;
  relation_type: string;
  invite_code: string;
}

interface OwnerProfile {
  id: string;
  first_name: string;
  gender: string;
  looking_for: string;
}

interface BrowseProfile {
  id: string;
  first_name: string;
  birth_date: string;
  origin_country: string;
  city: string;
  bio: string | null;
  photos: string[];
}

const RELATION_EMOJIS: Record<string, string> = {
  mama: '\u{1F469}', papa: '\u{1F468}', schwester: '\u{1F469}\u200D\u{1F467}', bruder: '\u{1F468}\u200D\u{1F466}',
  cousine: '\u{1F469}\u200D\u{1F469}\u200D\u{1F467}', cousin: '\u{1F468}\u200D\u{1F468}\u200D\u{1F466}',
  tante: '\u{1F475}', onkel: '\u{1F474}', oma: '\u{1F475}', opa: '\u{1F474}', andere: '\u{1F46A}',
};

const RELATION_LABELS: Record<string, Record<string, string>> = {
  de: { mama: 'Mama', papa: 'Papa', schwester: 'Schwester', bruder: 'Bruder', cousine: 'Cousine', cousin: 'Cousin', tante: 'Tante', onkel: 'Onkel', oma: 'Oma', opa: 'Opa', andere: 'Familie' },
  en: { mama: 'Mom', papa: 'Dad', schwester: 'Sister', bruder: 'Brother', cousine: 'Cousin', cousin: 'Cousin', tante: 'Aunt', onkel: 'Uncle', oma: 'Grandma', opa: 'Grandpa', andere: 'Family' },
  sr: { mama: 'Mama', papa: 'Tata', schwester: 'Sestra', bruder: 'Brat', cousine: 'Rodjakinja', cousin: 'Rodjak', tante: 'Tetka', onkel: 'Ujak', oma: 'Baka', opa: 'Djed', andere: 'Porodica' },
  sq: { mama: 'Nena', papa: 'Babi', schwester: 'Motra', bruder: 'Vellai', cousine: 'Kushirira', cousin: 'Kushiriri', tante: 'Tezja', onkel: 'Daja', oma: 'Gjyshja', opa: 'Gjyshi', andere: 'Familja' },
};

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

type ViewState = 'loading' | 'invalid' | 'welcome' | 'browse' | 'done';

export default function FamilyBrowsePage() {
  const params = useParams();
  const code = params.code as string;

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [profiles, setProfiles] = useState<BrowseProfile[]>([]);
  const [profileIndex, setProfileIndex] = useState(0);
  const [suggestMessage, setSuggestMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showSentToast, setShowSentToast] = useState(false);
  const [suggestCount, setSuggestCount] = useState(0);
  const [lang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('heybalkan-lang') || 'de';
    }
    return 'de';
  });

  const rl = (key: string) => RELATION_LABELS[lang]?.[key] || RELATION_LABELS['de'][key] || key;

  const loadData = useCallback(async () => {
    // 1. Find family member by invite code
    const { data: memberData, error: memberError } = await supabase
      .from('family_members')
      .select('id, owner_id, name, relation_type, invite_code')
      .eq('invite_code', code)
      .single();

    if (memberError || !memberData) {
      setViewState('invalid');
      return;
    }

    setMember(memberData);

    // 2. Load the owner's profile
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('id, first_name, gender, looking_for')
      .eq('id', memberData.owner_id)
      .single();

    if (!ownerData) {
      setViewState('invalid');
      return;
    }

    setOwner(ownerData);

    // 3. Load already-suggested profiles by this member
    const { data: alreadySuggested } = await supabase
      .from('porodica_suggestions')
      .select('suggested_profile_id')
      .eq('family_member_id', memberData.id);

    // 4. Load already-swiped profiles by the owner
    const { data: alreadySwiped } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', ownerData.id);

    const exclude = [
      ownerData.id,
      ...(alreadySuggested?.map(s => s.suggested_profile_id) || []),
      ...(alreadySwiped?.map(s => s.swiped_id) || []),
    ];

    // 5. Load profiles matching owner's preferences
    let query = supabase
      .from('profiles')
      .select('id, first_name, birth_date, origin_country, city, bio, photos')
      .not('id', 'in', `(${exclude.join(',')})`)
      .eq('onboarding_complete', true);

    if (ownerData.looking_for === 'female') {
      query = query.eq('gender', 'female');
    } else if (ownerData.looking_for === 'male') {
      query = query.eq('gender', 'male');
    }

    if (ownerData.gender) {
      query = query.or(`looking_for.eq.${ownerData.gender},looking_for.eq.both`);
    }

    const { data: profileData } = await query.limit(50);
    setProfiles(profileData || []);
    setViewState('welcome');
  }, [code]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Suggest profile
  const handleSuggest = async () => {
    if (!member || !owner) return;
    const profile = profiles[profileIndex];
    if (!profile) return;

    setSwipeDirection('right');

    await supabase.from('porodica_suggestions').insert({
      family_member_id: member.id,
      for_user_id: owner.id,
      suggested_profile_id: profile.id,
      message: suggestMessage || null,
    });

    setSuggestMessage('');
    setShowMessageInput(false);
    setSuggestCount(prev => prev + 1);
    setShowSentToast(true);
    setTimeout(() => setShowSentToast(false), 2000);

    setTimeout(() => {
      setSwipeDirection(null);
      const next = profileIndex + 1;
      if (next >= profiles.length) {
        setViewState('done');
      } else {
        setProfileIndex(next);
      }
    }, 300);
  };

  // Skip profile
  const handleSkip = () => {
    setSwipeDirection('left');
    setShowMessageInput(false);
    setSuggestMessage('');
    setTimeout(() => {
      setSwipeDirection(null);
      const next = profileIndex + 1;
      if (next >= profiles.length) {
        setViewState('done');
      } else {
        setProfileIndex(next);
      }
    }, 300);
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // INVALID CODE
  // ==========================================
  if (viewState === 'invalid') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">{'\u{1F6AB}'}</p>
          <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-slate-400">Dieser Einladungslink ist ungueltig oder abgelaufen.</p>
          <p className="text-slate-500 text-sm mt-2">Bitte frage nach einem neuen Link.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // WELCOME SCREEN
  // ==========================================
  if (viewState === 'welcome' && member && owner) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 flex items-center justify-center mb-4">
              <span className="text-4xl">{RELATION_EMOJIS[member.relation_type]}</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">
            Hej {member.name}! {'\u{1F44B}'}
          </h1>

          <p className="text-slate-300 text-lg mb-2">
            {rl(member.relation_type)} von {owner.first_name}
          </p>

          <p className="text-slate-400 mb-8">
            Hilf {owner.first_name} den perfekten Match zu finden!
            Swipe durch Profile und schlage die besten vor.
          </p>

          <button
            onClick={() => setViewState('browse')}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition active:scale-95"
          >
            {'\u{1F440}'} Profile anschauen
          </button>

          <p className="text-slate-500 text-xs mt-4">
            Powered by Hey Balkan {'\u{2764}\u{FE0F}'}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // DONE SCREEN
  // ==========================================
  if (viewState === 'done' && member && owner) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">{'\u{1F389}'}</p>
          <h1 className="text-2xl font-bold text-white mb-2">Danke, {member.name}!</h1>
          <p className="text-slate-300 mb-2">
            Du hast <span className="text-purple-400 font-bold">{suggestCount}</span> Profile fuer {owner.first_name} vorgeschlagen.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {owner.first_name} wird benachrichtigt und kann deine Vorschlaege durchschauen.
          </p>
          <button
            onClick={() => {
              setProfileIndex(0);
              setSuggestCount(0);
              loadData();
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-500 transition"
          >
            {'\u{1F504}'} Nochmal schauen
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // BROWSE MODE
  // ==========================================
  if (viewState === 'browse' && member && owner) {
    const currentProfile = profiles[profileIndex];

    if (!currentProfile) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <p className="text-6xl mb-4">{'\u{1F44D}'}</p>
            <h1 className="text-2xl font-bold text-white mb-2">Keine weiteren Profile</h1>
            <p className="text-slate-400">Schau spaeter nochmal vorbei!</p>
          </div>
        </div>
      );
    }

    const age = getAge(currentProfile.birth_date);
    const country = getFlag(currentProfile.origin_country);
    const photo = currentProfile.photos?.[0];

    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setViewState('welcome')}
              className="flex items-center gap-2 text-slate-400"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2 bg-purple-600/20 px-3 py-1.5 rounded-full">
              <span className="text-sm">{RELATION_EMOJIS[member.relation_type]}</span>
              <span className="text-sm text-purple-300 font-medium">
                Fuer {owner.first_name}
              </span>
            </div>
            <div className="text-purple-400 text-sm font-bold">
              {suggestCount} {'\u{1F49C}'}
            </div>
          </div>

          {/* Profile Card */}
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
              style={{ aspectRatio: '3/4', maxHeight: '58vh' }}
            >
              {photo ? (
                <img src={photo} alt={currentProfile.first_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 via-purple-600 to-pink-700 flex items-center justify-center">
                  <span className="text-8xl">{'\u{1F464}'}</span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
                <h2 className="text-3xl font-extrabold text-white">
                  {currentProfile.first_name}, {age}
                </h2>
                {country && (
                  <p className="text-white/90 text-lg mt-1">{country.flag} {country.name}</p>
                )}
                {currentProfile.city && (
                  <p className="text-white/70 text-sm mt-1">{'\u{1F4CD}'} {currentProfile.city}</p>
                )}
                {currentProfile.bio && (
                  <p className="text-white/60 text-sm mt-2 line-clamp-2">{currentProfile.bio}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Message input */}
          <AnimatePresence>
            {showMessageInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  value={suggestMessage}
                  onChange={e => setSuggestMessage(e.target.value)}
                  placeholder={`Nachricht an ${owner.first_name} (optional)...`}
                  className="w-full mt-3 p-3 rounded-xl bg-slate-800 text-white border border-purple-500/50 text-sm resize-none focus:outline-none"
                  rows={2}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-5 mt-4">
            <button
              onClick={handleSkip}
              className="w-16 h-16 rounded-full bg-slate-800 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition active:scale-90"
            >
              <SkipForward size={28} className="text-red-500" />
            </button>

            <button
              onClick={() => setShowMessageInput(!showMessageInput)}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition active:scale-90 ${
                showMessageInput ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-purple-500 text-purple-500 hover:bg-purple-500/20'
              }`}
            >
              <Send size={18} />
            </button>

            <button
              onClick={handleSuggest}
              className="w-16 h-16 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center hover:bg-green-500/20 transition active:scale-90"
            >
              <Heart size={28} className="text-green-500" />
            </button>
          </div>

          <p className="text-center text-slate-500 text-xs mt-3">
            {profileIndex + 1} / {profiles.length} Profile
          </p>

          {/* Toast */}
          <AnimatePresence>
            {showSentToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg"
              >
                {'\u{1F49C}'} Vorgeschlagen!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return null;
}
