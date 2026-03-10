'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Heart, ChevronRight, Users, Inbox, ArrowLeft, Send, SkipForward, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { COUNTRIES } from '@/lib/constants';

interface FamilyMember {
  id: string;
  name: string;
  relation_type: string;
  photo: string | null;
  created_at: string;
}

interface Suggestion {
  id: number;
  family_member_id: string;
  suggested_profile_id: string;
  message: string | null;
  status: string;
  created_at: string;
  family_member?: FamilyMember;
  suggested_profile?: {
    id: string;
    first_name: string;
    birth_date: string;
    origin_country: string;
    city: string;
    bio: string | null;
    photos: string[];
  };
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

const RELATION_TYPES = [
  'mama', 'papa', 'schwester', 'bruder', 'cousine', 'cousin',
  'tante', 'onkel', 'oma', 'opa', 'andere',
];

const RELATION_EMOJIS: Record<string, string> = {
  mama: '\u{1F469}', papa: '\u{1F468}', schwester: '\u{1F469}\u200D\u{1F467}', bruder: '\u{1F468}\u200D\u{1F466}',
  cousine: '\u{1F469}\u200D\u{1F469}\u200D\u{1F467}', cousin: '\u{1F468}\u200D\u{1F468}\u200D\u{1F466}',
  tante: '\u{1F475}', onkel: '\u{1F474}', oma: '\u{1F475}', opa: '\u{1F474}', andere: '\u{1F46A}',
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

type ViewMode = 'dashboard' | 'add-member' | 'browse' | 'suggestions';

export default function PorodicaPage() {
  const { t } = useLanguage();
  const [userId, setUserId] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Add member form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('mama');
  const [saving, setSaving] = useState(false);

  // Browse mode
  const [activeMember, setActiveMember] = useState<FamilyMember | null>(null);
  const [browseProfiles, setBrowseProfiles] = useState<BrowseProfile[]>([]);
  const [browseIndex, setBrowseIndex] = useState(0);
  const [suggestMessage, setSuggestMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showSentToast, setShowSentToast] = useState(false);

  const loadData = useCallback(async (uid: string) => {
    // Load family members
    const { data: members } = await supabase
      .from('family_members')
      .select('*')
      .eq('owner_id', uid)
      .order('created_at');

    setFamilyMembers(members || []);

    // Load suggestions with profiles
    const { data: suggs } = await supabase
      .from('porodica_suggestions')
      .select('*')
      .eq('for_user_id', uid)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (suggs && suggs.length > 0) {
      // Load suggested profiles
      const profileIds = suggs.map(s => s.suggested_profile_id);
      const memberIds = suggs.map(s => s.family_member_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, birth_date, origin_country, city, bio, photos')
        .in('id', profileIds);

      const { data: memberData } = await supabase
        .from('family_members')
        .select('*')
        .in('id', memberIds);

      const enriched = suggs.map(s => ({
        ...s,
        suggested_profile: profiles?.find(p => p.id === s.suggested_profile_id),
        family_member: memberData?.find(m => m.id === s.family_member_id),
      }));

      setSuggestions(enriched);
    } else {
      setSuggestions([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        loadData(session.user.id);
      }
    });
  }, [loadData]);

  // Add family member
  const handleAddMember = async () => {
    if (!newName.trim()) return;
    setSaving(true);

    await supabase.from('family_members').insert({
      owner_id: userId,
      name: newName.trim(),
      relation_type: newRelation,
    });

    setNewName('');
    setNewRelation('mama');
    setSaving(false);
    setViewMode('dashboard');
    loadData(userId);
  };

  // Remove family member
  const handleRemoveMember = async (memberId: string) => {
    await supabase.from('family_members').delete().eq('id', memberId);
    loadData(userId);
  };

  // Start browse mode for a family member
  const startBrowse = async (member: FamilyMember) => {
    setActiveMember(member);
    setViewMode('browse');
    setBrowseIndex(0);

    // Load the USER's profile to get their looking_for preference
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('gender, looking_for')
      .eq('id', userId)
      .single();

    // Load already-suggested profile IDs
    const { data: alreadySuggested } = await supabase
      .from('porodica_suggestions')
      .select('suggested_profile_id')
      .eq('family_member_id', member.id)
      .eq('for_user_id', userId);

    // Load already-swiped profiles
    const { data: alreadySwiped } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId);

    const exclude = [
      userId,
      ...(alreadySuggested?.map(s => s.suggested_profile_id) || []),
      ...(alreadySwiped?.map(s => s.swiped_id) || []),
    ];

    let query = supabase
      .from('profiles')
      .select('id, first_name, birth_date, origin_country, city, bio, photos')
      .not('id', 'in', `(${exclude.join(',')})`)
      .eq('onboarding_complete', true);

    // Apply gender filter based on user's preference
    if (myProfile?.looking_for === 'female') {
      query = query.eq('gender', 'female');
    } else if (myProfile?.looking_for === 'male') {
      query = query.eq('gender', 'male');
    }

    // Mutual compatibility
    if (myProfile?.gender) {
      query = query.or(`looking_for.eq.${myProfile.gender},looking_for.eq.both`);
    }

    const { data } = await query.limit(50);
    setBrowseProfiles(data || []);
  };

  // Suggest a profile
  const handleSuggest = async () => {
    if (!activeMember) return;
    const profile = browseProfiles[browseIndex];
    if (!profile) return;

    setSwipeDirection('right');

    await supabase.from('porodica_suggestions').insert({
      family_member_id: activeMember.id,
      for_user_id: userId,
      suggested_profile_id: profile.id,
      message: suggestMessage || null,
    });

    setSuggestMessage('');
    setShowMessageInput(false);
    setShowSentToast(true);
    setTimeout(() => setShowSentToast(false), 2000);

    setTimeout(() => {
      setSwipeDirection(null);
      setBrowseIndex(prev => prev + 1);
    }, 300);
  };

  // Skip a profile in browse mode
  const handleSkip = () => {
    setSwipeDirection('left');
    setShowMessageInput(false);
    setSuggestMessage('');
    setTimeout(() => {
      setSwipeDirection(null);
      setBrowseIndex(prev => prev + 1);
    }, 300);
  };

  // Handle suggestion action (like/pass)
  const handleSuggestionAction = async (suggestionId: number, action: 'liked' | 'passed') => {
    await supabase
      .from('porodica_suggestions')
      .update({ status: action })
      .eq('id', suggestionId);

    // If liked, create a swipe (like) so the normal matching logic works
    if (action === 'liked') {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        await supabase.from('swipes').insert({
          swiper_id: userId,
          swiped_id: suggestion.suggested_profile_id,
          action: 'like',
        });

        // Check for match
        const { data: reverse } = await supabase
          .from('swipes')
          .select('id')
          .eq('swiper_id', suggestion.suggested_profile_id)
          .eq('swiped_id', userId)
          .in('action', ['like', 'super_like'])
          .single();

        if (reverse) {
          const u1 = userId < suggestion.suggested_profile_id ? userId : suggestion.suggested_profile_id;
          const u2 = userId < suggestion.suggested_profile_id ? suggestion.suggested_profile_id : userId;
          await supabase.from('matches').insert({ user1_id: u1, user2_id: u2 });
        }
      }
    }

    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ADD MEMBER VIEW
  // ==========================================
  if (viewMode === 'add-member') {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <button onClick={() => setViewMode('dashboard')} className="flex items-center gap-2 text-slate-400 mb-6">
          <ArrowLeft size={18} /> {t('back')}
        </button>

        <h1 className="text-2xl font-extrabold text-white mb-6">{t('addFamilyMember')}</h1>

        {/* Name */}
        <label className="text-sm text-slate-400 mb-1 block">{t('familyName')}</label>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="z.B. Mama Dragica"
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-4 focus:border-purple-500 focus:outline-none"
        />

        {/* Relation */}
        <label className="text-sm text-slate-400 mb-2 block">{t('relation')}</label>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {RELATION_TYPES.map(rel => (
            <button
              key={rel}
              onClick={() => setNewRelation(rel)}
              className={`p-3 rounded-xl text-sm font-medium transition ${
                newRelation === rel
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <span className="text-lg mr-1">{RELATION_EMOJIS[rel]}</span>
              {t(rel)}
            </button>
          ))}
        </div>

        {/* Save */}
        <button
          onClick={handleAddMember}
          disabled={!newName.trim() || saving}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-500 transition disabled:opacity-50"
        >
          {saving ? '...' : t('save')}
        </button>
      </div>
    );
  }

  // ==========================================
  // BROWSE MODE (Swiping for family member)
  // ==========================================
  if (viewMode === 'browse' && activeMember) {
    const currentProfile = browseProfiles[browseIndex];

    if (!currentProfile) {
      return (
        <div className="max-w-lg mx-auto px-4 pt-6">
          <button onClick={() => { setViewMode('dashboard'); setActiveMember(null); }} className="flex items-center gap-2 text-slate-400 mb-6">
            <ArrowLeft size={18} /> {t('exitPorodica')}
          </button>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center px-8">
              <p className="text-6xl mb-4">{RELATION_EMOJIS[activeMember.relation_type]}</p>
              <h2 className="text-2xl font-bold text-white mb-2">{t('noMoreProfiles')}</h2>
              <p className="text-slate-400">{t('checkBackLater')}</p>
            </div>
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
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { setViewMode('dashboard'); setActiveMember(null); }} className="flex items-center gap-2 text-slate-400">
            <ArrowLeft size={18} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 bg-purple-600/20 px-3 py-1.5 rounded-full">
            <span className="text-sm">{RELATION_EMOJIS[activeMember.relation_type]}</span>
            <span className="text-sm text-purple-300 font-medium">{t('swipingFor')} {activeMember.name}</span>
          </div>
        </div>

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
            style={{ aspectRatio: '3/4', maxHeight: '55vh' }}
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
                placeholder={t('addMessage')}
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
            className="w-14 h-14 rounded-full bg-slate-800 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition active:scale-90"
          >
            <SkipForward size={24} className="text-red-500" />
          </button>

          <button
            onClick={() => setShowMessageInput(!showMessageInput)}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition active:scale-90 ${
              showMessageInput ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-purple-500 text-purple-500 hover:bg-purple-500/20'
            }`}
          >
            <Send size={16} />
          </button>

          <button
            onClick={handleSuggest}
            className="w-14 h-14 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center hover:bg-green-500/20 transition active:scale-90"
          >
            <Heart size={24} className="text-green-500" />
          </button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {showSentToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg"
            >
              {'\u{1F49C}'} {t('suggestionSent')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==========================================
  // SUGGESTIONS VIEW
  // ==========================================
  if (viewMode === 'suggestions') {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <button onClick={() => setViewMode('dashboard')} className="flex items-center gap-2 text-slate-400 mb-6">
          <ArrowLeft size={18} /> {t('back')}
        </button>

        <h1 className="text-2xl font-extrabold text-white mb-2">{'\u{1F4E8}'} {t('suggestionsFor')}</h1>
        <p className="text-slate-400 text-sm mb-6">{t('noSuggestionsHint')}</p>

        {suggestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">{'\u{1F4ED}'}</p>
            <p className="text-slate-400">{t('noSuggestions')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map(suggestion => {
              const profile = suggestion.suggested_profile;
              if (!profile) return null;
              const age = getAge(profile.birth_date);
              const country = getFlag(profile.origin_country);
              const photo = profile.photos?.[0];
              const member = suggestion.family_member;

              return (
                <motion.div
                  key={suggestion.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -200 }}
                  className="bg-slate-800 rounded-2xl overflow-hidden"
                >
                  {/* Suggested by label */}
                  {member && (
                    <div className="px-4 pt-3 flex items-center gap-2">
                      <span className="text-sm">{RELATION_EMOJIS[member.relation_type]}</span>
                      <span className="text-xs text-purple-400 font-medium">
                        {t('suggestedBy')} {member.name} ({t(member.relation_type)})
                      </span>
                    </div>
                  )}

                  <div className="flex p-4 gap-4">
                    {/* Photo */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      {photo ? (
                        <img src={photo} alt={profile.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <span className="text-2xl">{'\u{1F464}'}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white">{profile.first_name}, {age}</h3>
                      {country && (
                        <p className="text-slate-300 text-sm">{country.flag} {country.name}</p>
                      )}
                      {profile.city && (
                        <p className="text-slate-400 text-xs">{'\u{1F4CD}'} {profile.city}</p>
                      )}
                      {suggestion.message && (
                        <p className="text-purple-300 text-xs mt-1 italic">&quot;{suggestion.message}&quot;</p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex border-t border-slate-700">
                    <button
                      onClick={() => handleSuggestionAction(suggestion.id, 'passed')}
                      className="flex-1 py-3 text-red-400 text-sm font-medium hover:bg-red-500/10 transition flex items-center justify-center gap-1"
                    >
                      <X size={16} /> {t('skipProfile')}
                    </button>
                    <div className="w-px bg-slate-700" />
                    <button
                      onClick={() => handleSuggestionAction(suggestion.id, 'liked')}
                      className="flex-1 py-3 text-green-400 text-sm font-medium hover:bg-green-500/10 transition flex items-center justify-center gap-1"
                    >
                      <Heart size={16} /> Like
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // DASHBOARD (Main view)
  // ==========================================
  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">{'\u{1F46A}'} {t('porodica')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('porodicaSubtitle')}</p>
      </div>

      {/* Suggestions banner */}
      {suggestions.length > 0 && (
        <button
          onClick={() => setViewMode('suggestions')}
          className="w-full mb-6 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between hover:border-purple-500/50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <Inbox size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">{suggestions.length} {t('suggestions')}</p>
              <p className="text-purple-300 text-xs">{t('viewSuggestions')}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-purple-400" />
        </button>
      )}

      {/* Family members */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            Familie
          </h2>
          <button
            onClick={() => setViewMode('add-member')}
            className="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-purple-500 transition"
          >
            <Plus size={16} /> {t('addFamilyMember')}
          </button>
        </div>

        {familyMembers.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">{'\u{1F46A}'}</p>
            <p className="text-white font-medium mb-1">{t('noFamilyMembers')}</p>
            <p className="text-slate-400 text-sm">{t('noFamilyHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {familyMembers.map(member => (
              <div
                key={member.id}
                className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <span className="text-2xl">{RELATION_EMOJIS[member.relation_type]}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold">{member.name}</p>
                    <p className="text-purple-400 text-sm">{t(member.relation_type)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startBrowse(member)}
                    className="bg-purple-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-purple-500 transition"
                  >
                    {t('browseFor').replace('{name}', '')} {'\u{1F440}'}
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold mb-3">{'\u{2139}\u{FE0F}'} So funktioniert&apos;s</h3>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex gap-3">
            <span className="text-purple-400 font-bold">1.</span>
            <span>Fuege Familienmitglieder hinzu (Mama, Papa, etc.)</span>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-bold">2.</span>
            <span>Swipe als Familienmitglied durch Profile</span>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-bold">3.</span>
            <span>Die vorgeschlagenen Profile erscheinen in deinem Posteingang</span>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-bold">4.</span>
            <span>Du entscheidest ob du Liken oder Skippen willst</span>
          </div>
        </div>
      </div>
    </div>
  );
}
