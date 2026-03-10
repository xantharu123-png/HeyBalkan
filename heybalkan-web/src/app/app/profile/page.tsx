'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Bell, HelpCircle, MessageSquare, Heart, X, ImagePlus, Pencil, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { COUNTRIES, DACH_COUNTRIES, SPOKEN_LANGUAGES, RELIGIONS, RELATIONSHIP_GOALS, APP_LANGUAGES, REGIONS } from '@/lib/constants';
import type { Locale } from '@/i18n/translations';

interface Profile {
  id: string;
  first_name: string;
  birth_date: string;
  gender: string;
  looking_for: string | null;
  origin_country: string;
  city: string;
  living_country: string;
  bio: string | null;
  photos: string[];
  spoken_languages: string[];
  relationship_goal: string;
  religion: string | null;
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_religion: string;
  preferred_origins: string[];
  preferred_regions: string[];
  origin_region: string | null;
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [livingCountry, setLivingCountry] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const [religion, setReligion] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([]);
  // Preferences
  const [prefAgeMin, setPrefAgeMin] = useState(18);
  const [prefAgeMax, setPrefAgeMax] = useState(50);
  const [prefReligion, setPrefReligion] = useState('egal');
  const [prefOrigins, setPrefOrigins] = useState<string[]>([]);
  const [prefRegions, setPrefRegions] = useState<string[]>([]);
  const [originRegion, setOriginRegion] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) {
        setProfile(data);
        populateFields(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const populateFields = (p: Profile) => {
    setFirstName(p.first_name || '');
    setBio(p.bio || '');
    setCity(p.city || '');
    setLivingCountry(p.living_country || '');
    setOriginCountry(p.origin_country || '');
    setSpokenLanguages(p.spoken_languages || []);
    setReligion(p.religion || '');
    setRelationshipGoal(p.relationship_goal || '');
    setLookingFor(p.looking_for || '');
    setExistingPhotos(p.photos || []);
    setNewPhotos([]);
    setPrefAgeMin(p.preferred_age_min || 18);
    setPrefAgeMax(p.preferred_age_max || 50);
    setPrefReligion(p.preferred_religion || 'egal');
    setPrefOrigins(p.preferred_origins || []);
    setPrefRegions(p.preferred_regions || []);
    setOriginRegion(p.origin_region || '');
  };

  const togglePrefOrigin = (code: string) => {
    setPrefOrigins(prev => {
      const next = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      if (!next.includes(code)) {
        const regionCodes = (REGIONS[code] || []).map(r => r.code);
        setPrefRegions(pr => pr.filter(r => !regionCodes.includes(r)));
      }
      return next;
    });
  };

  const togglePrefRegion = (code: string) => {
    setPrefRegions(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const startEditing = () => {
    if (profile) populateFields(profile);
    setEditing(true);
    setSaved(false);
  };

  const cancelEditing = () => {
    if (profile) populateFields(profile);
    setEditing(false);
  };

  const toggleLang = (lang: string) => {
    setSpokenLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalPhotos = existingPhotos.length + newPhotos.length;
    Array.from(files).forEach(file => {
      if (totalPhotos + newPhotos.length >= 6) return;
      const preview = URL.createObjectURL(file);
      setNewPhotos(prev => [...prev, { file, preview }]);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    // Upload new photos
    const uploadedUrls: string[] = [];
    for (let i = 0; i < newPhotos.length; i++) {
      const file = newPhotos[i].file;
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${profile.id}/photo_${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { contentType: file.type, upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    const allPhotos = [...existingPhotos, ...uploadedUrls];

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        bio: bio.trim() || null,
        city: city.trim(),
        living_country: livingCountry,
        origin_country: originCountry,
        spoken_languages: spokenLanguages,
        religion: religion || null,
        relationship_goal: relationshipGoal,
        looking_for: lookingFor || null,
        photos: allPhotos,
        preferred_age_min: prefAgeMin,
        preferred_age_max: prefAgeMax,
        preferred_religion: prefReligion,
        preferred_origins: prefOrigins,
        preferred_regions: prefRegions,
        origin_region: originRegion || null,
      })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      alert(error.message);
    } else {
      // Refresh profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      if (data) {
        setProfile(data);
        populateFields(data);
      }
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

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
  const dachCountry = DACH_COUNTRIES.find(c => c.code === profile.living_country);
  const age = getAge(profile.birth_date);
  const photo = profile.photos?.[0];
  const goalObj = RELATIONSHIP_GOALS.find(g => g.key === profile.relationship_goal);
  const regionObj = profile.origin_region && REGIONS[profile.origin_country]
    ? REGIONS[profile.origin_country].find(r => r.code === profile.origin_region)
    : null;

  // ───── VIEW MODE ─────
  if (!editing) {
    return (
      <div className="max-w-lg mx-auto">
        {/* Saved Toast */}
        {saved && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 z-50 shadow-lg animate-pulse">
            <Check size={18} /> {t('save')} ✓
          </div>
        )}

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 pt-10 pb-8 px-6 text-center relative">
          {/* Edit Button */}
          <button
            onClick={startEditing}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition backdrop-blur-sm"
          >
            <Pencil size={14} />
            {t('editProfile')}
          </button>

          {photo ? (
            <img src={photo} alt="" className="w-28 h-28 rounded-full border-4 border-white mx-auto object-cover shadow-xl" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mx-auto">
              <span className="text-5xl">👤</span>
            </div>
          )}
          <h2 className="text-2xl font-extrabold text-white mt-3">
            {profile.first_name}, {age}
          </h2>
          {country && (
            <p className="text-white/90 mt-1">{country.flag} {country.name}{regionObj ? ` – ${regionObj.name}` : ''}</p>
          )}
          {profile.city && dachCountry && (
            <p className="text-white/70 text-sm">📍 {profile.city}, {dachCountry.flag} {dachCountry.name}</p>
          )}
        </div>

        {/* Photos Gallery */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="px-6 py-5 border-b border-slate-800">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {profile.photos.map((p, i) => (
                <img key={i} src={p} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              ))}
            </div>
          </div>
        )}

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
          {goalObj && (
            <div className="flex items-center gap-2 text-sm">
              <Heart size={16} className="text-slate-400" />
              <span className="text-slate-300">{goalObj.emoji} {goalObj[language as keyof typeof goalObj] || goalObj.de}</span>
            </div>
          )}
          {profile.religion && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">🙏</span>
              <span className="text-slate-300">{profile.religion}</span>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="px-6 py-5 border-b border-slate-800 space-y-3">
          <h3 className="text-white font-semibold">{t('preferences')}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">🎂</span>
            <span className="text-slate-300">{t('ageRange')}: {profile.preferred_age_min || 18} – {profile.preferred_age_max || 50} {t('years')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">🙏</span>
            <span className="text-slate-300">
              {t('preferredReligion')}: {(profile.preferred_religion === 'egal' || !profile.preferred_religion) ? t('noPreference') : profile.preferred_religion}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">🌍</span>
            <span className="text-slate-300">
              {t('preferredOrigin')}: {(!profile.preferred_origins || profile.preferred_origins.length === 0)
                ? t('allCountries')
                : profile.preferred_origins.map(code => {
                    const c = COUNTRIES.find(x => x.code === code);
                    return c ? `${c.flag} ${c.name}` : code;
                  }).join(', ')
              }
            </span>
          </div>
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
            { icon: Bell, label: t('notifications') || 'Benachrichtigungen' },
            { icon: Shield, label: t('privacy') || 'Privatsphaere' },
            { icon: HelpCircle, label: t('help') || 'Hilfe' },
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

  // ───── EDIT MODE ─────
  const totalPhotos = existingPhotos.length + newPhotos.length;

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-700 px-6 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-white">{t('editProfile')}</h1>
        <p className="text-white/70 text-sm mt-1">{profile.first_name}, {age}</p>
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* Photos */}
        <div>
          <label className="block text-slate-200 font-semibold mb-3">{t('uploadPhotos')}</label>
          <p className="text-slate-400 text-sm mb-3">{t('photosHint')}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div className="grid grid-cols-3 gap-3">
            {/* Existing photos */}
            {existingPhotos.map((url, i) => (
              <div key={`existing-${i}`} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeExistingPhoto(i)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                >
                  <X size={14} className="text-white" />
                </button>
                {i === 0 && existingPhotos.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-[10px] font-bold text-center py-1">
                    Hauptfoto
                  </div>
                )}
              </div>
            ))}

            {/* New photos */}
            {newPhotos.map((photo, i) => (
              <div key={`new-${i}`} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeNewPhoto(i)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                >
                  <X size={14} className="text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[10px] font-bold text-center py-1">
                  Neu
                </div>
              </div>
            ))}

            {/* Add button */}
            {totalPhotos < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-800/50 hover:border-indigo-500 hover:bg-slate-800 transition"
              >
                <ImagePlus size={28} className="text-slate-400 mb-1" />
                <span className="text-[11px] text-slate-400">{t('addPhoto')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-slate-200 font-semibold mb-2">{t('firstName')}</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-slate-200 font-semibold mb-2">{t('writeBio')}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('bioPlaceholder')}
            maxLength={500}
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-slate-500 text-xs text-right mt-1">{bio.length}/500</p>
        </div>

        {/* City + Country */}
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

        {/* Origin Country + Region */}
        <div>
          <label className="block text-slate-200 font-semibold mb-3">{t('yourOrigin')}</label>
          <div className="grid grid-cols-2 gap-2">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                onClick={() => { setOriginCountry(c.code); setOriginRegion(''); }}
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
          {originCountry && REGIONS[originCountry] && (
            <div className="mt-4">
              <label className="block text-slate-200 font-semibold mb-2">Region / Stadt</label>
              <div className="space-y-2">
                {REGIONS[originCountry].map(r => (
                  <button
                    key={r.code}
                    onClick={() => setOriginRegion(r.code)}
                    className={`w-full py-3 px-4 rounded-xl text-left font-medium transition text-sm ${
                      originRegion === r.code
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    📍 {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Languages */}
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

        {/* Looking For */}
        <div>
          <label className="block text-slate-200 font-semibold mb-3">Ich suche...</label>
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

        {/* Religion */}
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

        {/* ── PREFERENCES SECTION ── */}
        <div className="border-t border-slate-700 pt-8">
          <h2 className="text-xl font-bold text-white mb-1">{t('preferences')}</h2>
          <p className="text-slate-400 text-sm mb-6">{t('preferencesHint')}</p>

          {/* Age Range */}
          <div className="mb-6">
            <label className="block text-slate-200 font-semibold mb-3">{t('ageRange')}</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-slate-400 text-xs mb-1">{t('ageFrom')}</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={prefAgeMin}
                  onChange={(e) => setPrefAgeMin(Math.max(18, parseInt(e.target.value) || 18))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-slate-500 text-2xl font-light mt-5">–</span>
              <div className="flex-1">
                <label className="block text-slate-400 text-xs mb-1">{t('ageTo')}</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={prefAgeMax}
                  onChange={(e) => setPrefAgeMax(Math.min(99, parseInt(e.target.value) || 50))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Religion Preference */}
          <div className="mb-6">
            <label className="block text-slate-200 font-semibold mb-3">{t('preferredReligion')}</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPrefReligion('egal')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  prefReligion === 'egal'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                }`}
              >
                🌍 {t('noPreference')}
              </button>
              {RELIGIONS.filter(r => r !== 'Keine Angabe').map(r => (
                <button
                  key={r}
                  onClick={() => setPrefReligion(r)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    prefReligion === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Origin Preference */}
          <div>
            <label className="block text-slate-200 font-semibold mb-2">{t('preferredOrigin')}</label>
            <p className="text-slate-400 text-xs mb-3">
              {prefOrigins.length === 0 ? t('allCountries') : `${prefOrigins.length} ${t('selectedCountries')}`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => togglePrefOrigin(c.code)}
                  className={`py-3 px-4 rounded-xl text-left font-medium transition text-sm ${
                    prefOrigins.includes(c.code)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {c.flag} {c.name}
                </button>
              ))}
            </div>
            {prefOrigins.length > 0 && (
              <button
                onClick={() => { setPrefOrigins([]); setPrefRegions([]); }}
                className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
              >
                ↩ {t('allCountries')}
              </button>
            )}

            {/* Regionen fuer ausgewaehlte Laender */}
            {prefOrigins.length > 0 && (
              <div className="mt-4">
                <label className="block text-slate-200 font-semibold mb-2">Regionen (optional)</label>
                <p className="text-slate-400 text-xs mb-3">
                  {prefRegions.length === 0 ? 'Alle Regionen' : `${prefRegions.length} Regionen ausgewaehlt`}
                </p>
                {prefOrigins.map(countryCode => {
                  const ctry = COUNTRIES.find(c => c.code === countryCode);
                  const regions = REGIONS[countryCode];
                  if (!regions || !ctry) return null;
                  return (
                    <div key={countryCode} className="mb-3">
                      <p className="text-slate-300 text-sm font-medium mb-2">{ctry.flag} {ctry.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {regions.map(r => (
                          <button
                            key={r.code}
                            onClick={() => togglePrefRegion(r.code)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                              prefRegions.includes(r.code)
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {r.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Relationship Goal */}
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

      {/* Save / Cancel Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4 z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={cancelEditing}
            className="flex-1 bg-slate-800 text-slate-200 font-semibold py-3 rounded-xl hover:bg-slate-700 transition"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !firstName.trim()}
            className="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Check size={18} />
                {t('save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
