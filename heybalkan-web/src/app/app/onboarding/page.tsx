'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, ImagePlus } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [livingCountry, setLivingCountry] = useState('');
  const [religion, setReligion] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (photos.length >= 6) return;
      const preview = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { file, preview }]);
    });

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim() && birthDate.length === 10 && gender && lookingFor;
      case 2: return originCountry && spokenLanguages.length > 0;
      case 3: return city.trim() && livingCountry;
      case 4: return relationshipGoal;
      case 5: return photos.length >= 1;
      case 6: return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    if (!userId) return;
    setLoading(true);

    // Upload photos to Supabase Storage
    const photoUrls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i].file;
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/photo_${i}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { contentType: file.type, upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }
    }

    // Parse birth date DD.MM.YYYY -> YYYY-MM-DD
    const parts = birthDate.split('.');
    const isoDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : birthDate;

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      first_name: firstName.trim(),
      birth_date: isoDate,
      gender,
      looking_for: lookingFor,
      origin_country: originCountry,
      spoken_languages: spokenLanguages,
      city: city.trim(),
      living_country: livingCountry,
      religion: religion || null,
      relationship_goal: relationshipGoal,
      bio: bio.trim() || null,
      photos: photoUrls,
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
      <div className="max-w-lg mx-auto px-6 py-8 pb-28">

        {/* Step 1: Name, Birthday, Gender, Looking For */}
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
            <div>
              <label className="block text-slate-200 font-semibold mb-2">Ich suche...</label>
              <div className="flex gap-3">
                {[{ key: 'female', label: 'Frauen' }, { key: 'male', label: 'Maenner' }, { key: 'both', label: 'Beide' }].map(g => (
                  <button
                    key={g.key}
                    onClick={() => setLookingFor(g.key)}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      lookingFor === g.key
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

        {/* Step 5: Photos - REAL UPLOAD */}
        {step === 5 && (
          <div className="space-y-4">
            <label className="block text-slate-200 font-semibold">{t('uploadPhotos')}</label>
            <p className="text-slate-400 text-sm">{t('photosHint')}</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <div className="grid grid-cols-3 gap-3">
              {/* Uploaded photos */}
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                  <img
                    src={photo.preview}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                  >
                    <X size={14} className="text-white" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-[10px] font-bold text-center py-1">
                      Hauptfoto
                    </div>
                  )}
                </div>
              ))}

              {/* Add photo button */}
              {photos.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-800/50 hover:border-indigo-500 hover:bg-slate-800 transition"
                >
                  <ImagePlus size={28} className="text-slate-400 mb-1" />
                  <span className="text-[11px] text-slate-400">{t('addPhoto')}</span>
                </button>
              )}
            </div>

            {photos.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 font-semibold hover:bg-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Fotos auswaehlen
              </button>
            )}
          </div>
        )}

        {/* Step 6: Bio */}
        {step === 6 && (
          <div className="space-y-4">
            <label className="block text-slate-200 font-semibold">{t('writeBio')}</label>
            <p className="text-slate-400 text-sm">Erzaehl etwas ueber dich – was machst du gerne, was ist dir wichtig?</p>
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
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {step === TOTAL_STEPS ? 'Profil wird erstellt...' : '...'}
              </span>
            ) : (
              step === TOTAL_STEPS ? t('letsGo') : t('next')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
