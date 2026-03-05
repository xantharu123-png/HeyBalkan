import React, { useState, useEffect } from 'react';
import { Instagram, Copy, Check, ChevronRight, Users, Trophy, Share2, User, Sparkles } from 'lucide-react';

const postSignupTranslations = {
  de: {
    welcome: "Willkommen in der Hey Balkan Familie!",
    position: "Deine Wartelisten-Position",
    referral: {
      title: "Lade Freunde ein & spring nach vorne!",
      subtitle: "Fuer jede Einladung rueckst du 10 Plaetze nach vorne.",
      rewards: [
        { count: 3, reward: "3 Monate Premium gratis" },
        { count: 5, reward: "6 Monate Premium gratis" },
        { count: 10, reward: "1 Jahr Premium + Gruender-Badge" },
      ],
      yourLink: "Dein persoenlicher Einladungslink:",
      copied: "Kopiert!",
      copy: "Kopieren",
      invited: "eingeladen",
      share: "Teilen",
      shareText: "Hey! Ich bin auf der Warteliste fuer Hey Balkan – die erste Dating-App fuer die Balkan-Diaspora. Meld dich auch an:",
    },
    profile: {
      title: "Erstelle schon dein Profil",
      subtitle: "Damit du beim Launch sofort loslegen kannst!",
      name: "Dein Name",
      bio: "Ueber dich (kurz & knackig)",
      bioPlaceholder: "z.B. Aus Sarajevo, lebe in Zuerich. Kaffee > alles.",
      save: "Profil speichern",
      saved: "Gespeichert!",
      skip: "Spaeter machen",
    },
    social: {
      title: "Folge uns fuer Updates",
      instagram: "Instagram folgen",
      tiktok: "TikTok folgen",
    },
    next: {
      title: "Was passiert als naechstes?",
      steps: [
        { icon: "📧", text: "Du bekommst eine Email wenn wir launchen" },
        { icon: "👥", text: "Lade Freunde ein um Premium zu bekommen" },
        { icon: "📱", text: "App herunterladen sobald sie live ist" },
        { icon: "❤️", text: "Dein erstes Match finden!" },
      ],
    },
  },
  en: {
    welcome: "Welcome to the Hey Balkan family!",
    position: "Your waitlist position",
    referral: {
      title: "Invite friends & jump the line!",
      subtitle: "For each invite you move up 10 spots.",
      rewards: [
        { count: 3, reward: "3 months Premium free" },
        { count: 5, reward: "6 months Premium free" },
        { count: 10, reward: "1 year Premium + Founder badge" },
      ],
      yourLink: "Your personal invite link:",
      copied: "Copied!",
      copy: "Copy",
      invited: "invited",
      share: "Share",
      shareText: "Hey! I'm on the waitlist for Hey Balkan – the first dating app for the Balkan diaspora. Sign up too:",
    },
    profile: {
      title: "Create your profile now",
      subtitle: "So you're ready to go on launch day!",
      name: "Your name",
      bio: "About you (short & sweet)",
      bioPlaceholder: "e.g. From Sarajevo, living in Zurich. Coffee > everything.",
      save: "Save profile",
      saved: "Saved!",
      skip: "Do later",
    },
    social: {
      title: "Follow us for updates",
      instagram: "Follow Instagram",
      tiktok: "Follow TikTok",
    },
    next: {
      title: "What happens next?",
      steps: [
        { icon: "📧", text: "You'll get an email when we launch" },
        { icon: "👥", text: "Invite friends to earn Premium" },
        { icon: "📱", text: "Download the app when it goes live" },
        { icon: "❤️", text: "Find your first match!" },
      ],
    },
  },
  sr: {
    welcome: "Dobrodosli u Hey Balkan familiju!",
    position: "Tvoja pozicija na listi cekanja",
    referral: {
      title: "Pozovi prijatelje i preskoci red!",
      subtitle: "Za svaki poziv napredujesh 10 mjesta.",
      rewards: [
        { count: 3, reward: "3 mjeseca Premium besplatno" },
        { count: 5, reward: "6 mjeseci Premium besplatno" },
        { count: 10, reward: "1 godina Premium + Osnivac bedz" },
      ],
      yourLink: "Tvoj licni link za pozivanje:",
      copied: "Kopirano!",
      copy: "Kopiraj",
      invited: "pozvano",
      share: "Podijeli",
      shareText: "Hej! Na listi cekanja sam za Hey Balkan – prvu dating aplikaciju za balkansku dijasporu. Prijavi se i ti:",
    },
    profile: {
      title: "Napravi svoj profil vec sad",
      subtitle: "Da budhesh spremna/spreman za lansiranje!",
      name: "Tvoje ime",
      bio: "O tebi (kratko i jasno)",
      bioPlaceholder: "npr. Iz Sarajeva, zivim u Cirihu. Kafa > sve.",
      save: "Sacuvaj profil",
      saved: "Sacuvano!",
      skip: "Kasnije",
    },
    social: {
      title: "Zaprati nas za novosti",
      instagram: "Zaprati Instagram",
      tiktok: "Zaprati TikTok",
    },
    next: {
      title: "Sta dalje?",
      steps: [
        { icon: "📧", text: "Dobicesh email kad lansiramo" },
        { icon: "👥", text: "Pozovi prijatelje za Premium" },
        { icon: "📱", text: "Preuzmi app kad bude live" },
        { icon: "❤️", text: "Pronadji svoj prvi match!" },
      ],
    },
  },
  sq: {
    welcome: "Mire se erdhe ne familjen Hey Balkan!",
    position: "Pozicioni yt ne listen e pritjes",
    referral: {
      title: "Fto shoket dhe kalo perpara!",
      subtitle: "Per cdo ftese ecen 10 vende perpara.",
      rewards: [
        { count: 3, reward: "3 muaj Premium falas" },
        { count: 5, reward: "6 muaj Premium falas" },
        { count: 10, reward: "1 vit Premium + Emblema e themeluesit" },
      ],
      yourLink: "Linku yt personal i fteses:",
      copied: "U kopjua!",
      copy: "Kopjo",
      invited: "te ftuar",
      share: "Ndaj",
      shareText: "Hej! Jam ne listen e pritjes per Hey Balkan – aplikacionin e pare te takimeve per diasporen ballkanike. Regjistrohu edhe ti:",
    },
    profile: {
      title: "Krijo profilin tende tani",
      subtitle: "Qe te jesh gati per diten e lansimit!",
      name: "Emri yt",
      bio: "Per ty (shkurt dhe bukur)",
      bioPlaceholder: "p.sh. Nga Prishtina, jetoj ne Cyrih. Kafeja > gjithcka.",
      save: "Ruaj profilin",
      saved: "U ruajt!",
      skip: "Me vone",
    },
    social: {
      title: "Na ndiq per perditesime",
      instagram: "Ndiq Instagram",
      tiktok: "Ndiq TikTok",
    },
    next: {
      title: "Cfare ndodh me pas?",
      steps: [
        { icon: "📧", text: "Do te marresh email kur te lansojme" },
        { icon: "👥", text: "Fto shoket per te fituar Premium" },
        { icon: "📱", text: "Shkarko app-in kur te behet live" },
        { icon: "❤️", text: "Gjej ndeshjen tende te pare!" },
      ],
    },
  },
};

export default function PostSignup({ email, lang, supabase }) {
  const t = postSignupTranslations[lang] || postSignupTranslations.de;
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [position, setPosition] = useState(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [step, setStep] = useState(0); // animation step

  useEffect(() => {
    // Fetch user data from supabase
    const fetchUserData = async () => {
      const { data } = await supabase
        .from('waitlist')
        .select('referral_code, referral_count, position, name, bio')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (data) {
        setReferralCode(data.referral_code || '');
        setReferralCount(data.referral_count || 0);
        setPosition(data.position || null);
        if (data.name) setName(data.name);
        if (data.bio) setBio(data.bio);
      }
    };
    fetchUserData();

    // Animate sections appearing
    const timers = [0, 1, 2, 3, 4].map((i) =>
      setTimeout(() => setStep(i + 1), 300 + i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [email]);

  const referralLink = referralCode
    ? `${window.location.origin}?ref=${referralCode}`
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hey Balkan',
        text: t.referral.shareText,
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) return;
    await supabase
      .from('waitlist')
      .update({ name: name.trim(), bio: bio.trim() })
      .eq('email', email.toLowerCase().trim());
    setProfileSaved(true);
    setTimeout(() => setShowProfile(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 py-8 max-w-lg mx-auto">
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-700 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{t.welcome}</h1>
          {position && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mt-4">
              <Trophy size={18} className="text-yellow-300" />
              <span className="text-white font-medium">{t.position}: <span className="font-black text-yellow-300">#{position}</span></span>
            </div>
          )}
        </div>

        {/* Referral Section */}
        <div className={`bg-white/15 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20 transition-all duration-700 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-yellow-300" />
            <h2 className="text-lg font-bold text-white">{t.referral.title}</h2>
          </div>
          <p className="text-white/70 text-sm mb-4">{t.referral.subtitle}</p>

          {/* Reward tiers */}
          <div className="space-y-2 mb-5">
            {t.referral.rewards.map((r) => (
              <div key={r.count} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                referralCount >= r.count ? 'bg-yellow-400/20 text-yellow-200' : 'bg-white/5 text-white/60'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  referralCount >= r.count ? 'bg-yellow-400 text-indigo-900' : 'bg-white/10 text-white/40'
                }`}>
                  {referralCount >= r.count ? <Check size={14} /> : r.count}
                </div>
                <span>{r.count} {t.referral.invited} → <strong>{r.reward}</strong></span>
              </div>
            ))}
          </div>

          {/* Referral link */}
          {referralLink && (
            <>
              <p className="text-white/60 text-xs mb-2">{t.referral.yourLink}</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm truncate font-mono">
                  {referralLink}
                </div>
                <button
                  onClick={copyLink}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all ${
                    copied ? 'bg-green-500 text-white' : 'bg-white text-indigo-600 hover:shadow-lg'
                  }`}
                >
                  {copied ? <><Check size={14} /> {t.referral.copied}</> : <><Copy size={14} /> {t.referral.copy}</>}
                </button>
              </div>
              <button
                onClick={shareLink}
                className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Share2 size={16} /> {t.referral.share}
              </button>
            </>
          )}

          {referralCount > 0 && (
            <div className="mt-4 text-center">
              <span className="text-2xl font-black text-yellow-300">{referralCount}</span>
              <span className="text-white/60 text-sm ml-2">{t.referral.invited}</span>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className={`bg-white/15 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20 transition-all duration-700 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {!showProfile ? (
            <button
              onClick={() => setShowProfile(true)}
              className="w-full flex items-center justify-between text-white"
            >
              <div className="flex items-center gap-2">
                <User size={20} className="text-purple-300" />
                <span className="font-bold">{t.profile.title}</span>
              </div>
              <ChevronRight size={20} className="text-white/60" />
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User size={20} className="text-purple-300" />
                <h2 className="text-lg font-bold text-white">{t.profile.title}</h2>
              </div>
              <p className="text-white/60 text-sm mb-4">{t.profile.subtitle}</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.profile.name}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t.profile.bioPlaceholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      profileSaved ? 'bg-green-500 text-white' : 'bg-white text-indigo-600 hover:shadow-lg'
                    }`}
                  >
                    {profileSaved ? <><Check size={16} /> {t.profile.saved}</> : t.profile.save}
                  </button>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="px-4 py-3 rounded-xl text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {t.profile.skip}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Social Media */}
        <div className={`bg-white/15 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20 transition-all duration-700 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-pink-300" />
            <h2 className="text-lg font-bold text-white">{t.social.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://instagram.com/heybalkan.app"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            >
              <Instagram size={18} /> {t.social.instagram}
            </a>
            <a
              href="https://tiktok.com/@heybalkan.app"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-stone-800 to-stone-900 text-white py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            >
              📱 {t.social.tiktok}
            </a>
          </div>
        </div>

        {/* What happens next */}
        <div className={`bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20 transition-all duration-700 ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-lg font-bold text-white mb-4">{t.next.title}</h2>
          <div className="space-y-3">
            {t.next.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-white/90 text-sm">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/40 text-sm">
          <span className="text-xl">👋</span>
          <p className="mt-1">Hey Balkan – {lang === 'de' ? 'Spring' : lang === 'sr' ? 'Proljece' : lang === 'sq' ? 'Pranvera' : 'Spring'} 2026</p>
        </div>
      </div>
    </div>
  );
}
