'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { COUNTRIES, DACH_COUNTRIES, SPOKEN_LANGUAGES, RELIGIONS, RELATIONSHIP_GOALS } from '@/lib/constants';

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [livingCountry, setLivingCountry] = useState('');
  const [religion, setReligion] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/auth/login'); return; }
      setUserId(session.user.id);
    });
  }, [router]);

  const toggleLang = (lang: string) => {
    setSpokenLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim() && birthDate.length === 10 && gender;
      case 2: return originCountry && spokenLanguages.length > 0;
      case 3: return city.trim() && livingCountry;
      case 4: return relationshipGoal;
      case 5: return true; // photos optional for web MVP
      case 6: return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    if (!userId) return;
    setLoading(true);

    // Parse birth date DD.MM.YYYY -> YYYY-MM-DD
    const parts = birthDate.split('.');
    const isoDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : birthDate;

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      first_name: firstName.trim(),
      birth_date: isoDate,
      gender,
      origin_country: originCountry,
      spoken_languages: spokenLanguages,
      city: city.trim(),
      living_country: livingCountry,
      religion: religion || null,
      relationship_goal: relationshipGoal,
      bio: bio.trim() || null,
      photos: [],
      onboarding_complete: true,
    });

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      router.push('/app/discover');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-700 px-6 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-white">{t('onboardingTitle')}</h1>
        <p className="text-white/70 text-sm mt-1">{t('step')} {step} {t('of')} {TOTAL_STEPS}</p>
        <div className="mt-4 h-1 bg-white/20 rounded-full">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Step 1: Name, Birthday, Gender */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-200 font-semibold mb-2">{t('firstName')}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('firstName')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-200 font-semibold mb-2">{t('birthDate')}</label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9]/g, '');
                  if (v.length > 2) v = v.slice(0, 2) + '.' + v.slice(2);
                  if (v.length > 5) v = v.slice(0, 5) + '.' + v.slice(5, 9);
                  setBirthDate(v);
                }}
                placeholder="TT.MM.JJJJ"
                maxLength={10}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-200 font-semibold mb-2">{t('gender')}</label>
              <div className="flex gap-3">
                {[{ key: 'male', label: t('male') }, { key: 'female', label: t('female') }, { key: 'other', label: t('other') }].map(g => (
                  <button
                    key={g.key}
                    onClick={() => setGender(g.key)}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      gender === g.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Origin + Languages */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-200 font-semibold mb-3">{t('yourOrigin')}</label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setOriginCountry(c.code)}
                    className={`py-3 px-4 rounded-xl text-left font-medium transition ${
                      originCountry === c.code
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-200 font-semibold mb-3">{t('yourLanguages')}</label>
              <div className="flex flex-wrap gap-2">
                {SPOKEN_LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleLang(lang)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      spokenLanguages.includes(lang)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: City + Country */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-200 font-semibold mb-2">{t('yourCity')}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="z.B. Zuerich, Berlin, Wien..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-200 font-semibold mb-3">{t('yourCountry')}</label>
              <div className="space-y-2">
                {DACH_COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setLivingCountry(c.code)}
                    className={`w-full py-3 px-4 rounded-xl text-left font-medium transition ${
                      livingCountry === c.code
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Religion + Relationship Goal */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-200 font-semibold mb-3">{t('yourReligion')}</label>
              <div className="flex flex-wrap gap-2">
                {RELIGIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setReligion(r)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      religion === r
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-200 font-semibold mb-3">{t('relationshipGoal')}</label>
              <div className="space-y-2">
                {RELATIONSHIP_GOALS.map(g => (
                  <button
                    key={g.key}
                    onClick={() => setRelationshipGoal(g.key)}
                    className={`w-full flex items-center gap-3 py-4 px-4 rounded-xl font-medium transition ${
                      relationshipGoal === g.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span>{g[language as keyof typeof g] || g.de}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Photos placeholder */}
        {step === 5 && (
          <div className="space-y-4">
            <label className="block text-slate-200 font-semibold">{t('uploadPhotos')}</label>
            <p className="text-slate-400 text-sm">{t('photosHint')}</p>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-800/50 cursor-pointer hover:border-slate-500 transition"
                >
                  <div className="text-center">
                    <span className="text-2xl text-slate-500">+</span>
                    <p className="text-[10px] text-slate-500 mt-1">{t('addPhoto')}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs text-center mt-2">
              Foto-Upload kommt bald! Du kannst diesen Schritt ueberspringen.
            </p>
          </div>
        )}

        {/* Step 6: Bio */}
        {step === 6 && (
          <div className="space-y-4">
            <label className="block text-slate-200 font-semibold">{t('writeBio')}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('bioPlaceholder')}
              maxLength={500}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-slate-500 text-xs text-right">{bio.length}/500</p>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 bg-slate-800 text-slate-200 font-semibold py-3 rounded-xl hover:bg-slate-700 transition"
            >
              {t('back')}
            </button>
          )}
          <button
            onClick={() => {
              if (step < TOTAL_STEPS) setStep(s => s + 1);
              else handleFinish();
            }}
            disabled={!canProceed() || loading}
            className={`${step > 1 ? 'flex-[2]' : 'flex-1'} bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition disabled:opacity-50`}
          >
            {loading ? '...' : step === TOTAL_STEPS ? t('letsGo') : t('next')}
          </button>
        </div>
      </div>
    </div>
  );
}
