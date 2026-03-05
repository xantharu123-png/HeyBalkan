import React, { useState } from 'react';
import { Heart, Users, Shield, Check, Send, Instagram, Globe } from 'lucide-react';
import { translations, countryList, countryListFull } from './translations';

export default function HeyBalkanLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [origin, setOrigin] = useState('');
  const [lang, setLang] = useState('de');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const t = translations[lang];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  const langOptions = [
    { code: 'de', label: 'DE', full: 'Deutsch' },
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'sr', label: 'SR', full: 'Srpski / Hrvatski' },
    { code: 'sq', label: 'SQ', full: 'Shqip' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Floating flags */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 left-[10%] text-6xl opacity-20 animate-pulse">🇷🇸</div>
          <div className="absolute top-40 right-[15%] text-5xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}>🇭🇷</div>
          <div className="absolute bottom-60 left-[20%] text-5xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}>🇧🇦</div>
          <div className="absolute bottom-40 right-[10%] text-6xl opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}>🇲🇪</div>
          <div className="absolute top-60 left-[40%] text-4xl opacity-20 animate-pulse" style={{animationDelay: '1.5s'}}>🇲🇰</div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👋</span>
            <span className="text-2xl font-black text-white">Hey Balkan</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
              >
                <Globe size={16} />
                {langOptions.find(l => l.code === lang)?.label}
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl overflow-hidden z-50 min-w-[160px]">
                  {langOptions.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => { setLang(option.code); setLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 ${
                        lang === option.code ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-stone-700'
                      }`}
                    >
                      <span className="font-bold text-xs w-6">{option.label}</span>
                      {option.full}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a href="https://instagram.com/heybalkan.app" target="_blank" className="text-white/80 hover:text-white transition-colors">
              <Instagram size={24} />
            </a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full text-white text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            {t.hero.badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            {t.hero.title} 👋
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-4 leading-relaxed">
            {t.hero.subtitle}<span className="font-bold">{t.hero.subtitleBold}</span>{t.hero.subtitleEnd}
          </p>

          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
            {t.hero.description}
          </p>

          {/* Signup Form */}
          {!submitted ? (
            <div className="max-w-lg mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.hero.emailPlaceholder}
                  className="flex-1 px-6 py-4 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg bg-white/95 backdrop-blur"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {t.hero.submitBtn} <Send size={18} />
                </button>
              </form>

              <div className="mt-5">
                <p className="text-white/70 text-sm mb-3">{t.hero.originQuestion}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {countryList.map((country) => (
                    <button
                      key={country.name}
                      type="button"
                      onClick={() => setOrigin(country.name)}
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${
                        origin === country.name
                          ? 'bg-white text-indigo-600 shadow-lg scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {country.flag} {country.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 max-w-md mx-auto border border-white/30">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">{t.hero.thankYouTitle}</h3>
              <p className="text-white/90 mb-6">{t.hero.thankYouText}</p>
              <p className="text-white/70 text-sm mb-4">
                {t.hero.earlyBonus}<span className="font-bold text-white">{t.hero.earlyBonusBold}</span>
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a href="https://instagram.com/heybalkan.app" target="_blank" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Instagram size={18} /> {t.hero.followBtn}
                </a>
              </div>
            </div>
          )}

          <p className="text-white/60 text-sm mt-8">
            <span className="text-white font-bold">3.241</span>{t.hero.waitlistCount}
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-current rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-current rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-stone-800 mb-4">{t.features.sectionTitle}</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">{t.features.sectionSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="text-indigo-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">{t.features.cultural.title}</h3>
            <p className="text-stone-600 leading-relaxed">{t.features.cultural.text} ☕</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-purple-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
              ✨ {t.features.porodica.badge}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-purple-700" size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">{t.features.porodica.title} 👩‍👦</h3>
            <p className="text-stone-600 leading-relaxed">
              <span className="font-medium">{t.features.porodica.optional}</span> {t.features.porodica.text} 😄
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="text-emerald-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">{t.features.verified.title}</h3>
            <p className="text-stone-600 leading-relaxed">{t.features.verified.text} 💯</p>
          </div>
        </div>
      </div>

      {/* Countries Section */}
      <div className="bg-gradient-to-br from-stone-100 to-stone-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-stone-800 mb-4">{t.countries.title}</h2>
          <p className="text-stone-600 mb-12">{t.countries.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {countryListFull.map((country) => (
              <div key={country} className="bg-white px-6 py-4 rounded-2xl shadow-md text-lg font-medium text-stone-700">
                {country}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-stone-800 mb-12 text-center">{t.testimonials.title}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">M</div>
                <div>
                  <p className="font-bold text-stone-800 text-lg">{t.testimonials.t1.name}</p>
                  <p className="text-stone-500">{t.testimonials.t1.location} • 🇷🇸</p>
                </div>
              </div>
              <p className="text-stone-600 text-lg leading-relaxed">
                {t.testimonials.t1.text}<span className="font-medium">{t.testimonials.t1.textBold}</span>{t.testimonials.t1.textEnd}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">A</div>
                <div>
                  <p className="font-bold text-stone-800 text-lg">{t.testimonials.t2.name}</p>
                  <p className="text-stone-500">{t.testimonials.t2.location} • 🇭🇷</p>
                </div>
              </div>
              <p className="text-stone-600 text-lg leading-relaxed">
                {t.testimonials.t2.text}<span className="font-medium">{t.testimonials.t2.textBold}</span>{t.testimonials.t2.textEnd} 😂
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-stone-800 mb-12 text-center">{t.howItWorks.title}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {t.howItWorks.steps.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.emoji}
                </div>
                <div className="text-sm text-indigo-600 font-bold mb-1">
                  {lang === 'de' ? 'Schritt' : lang === 'en' ? 'Step' : lang === 'sr' ? 'Korak' : 'Hapi'} {index + 1}
                </div>
                <h3 className="font-bold text-stone-800 mb-1">{item.title}</h3>
                <p className="text-stone-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-4xl font-black text-white mb-6">{t.cta.title}</h2>
          <p className="text-xl text-white/90 mb-8">
            {t.cta.subtitle}<br />
            <span className="font-bold">{t.cta.bonus}</span>
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.hero.emailPlaceholder}
                className="flex-1 px-6 py-4 rounded-2xl text-lg focus:outline-none shadow-lg"
                required
              />
              <button
                type="submit"
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all whitespace-nowrap"
              >
                {t.cta.submitBtn} 🚀
              </button>
            </form>
          ) : (
            <div className="text-white text-xl flex items-center justify-center gap-2">
              <Check className="text-green-300" /> {t.cta.submitted}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <span className="text-xl font-black text-white">Hey Balkan</span>
          </div>
          <p className="text-sm text-center md:text-left">{t.footer.copy}</p>
          <div className="flex gap-6">
            <a href="https://instagram.com/heybalkan.app" target="_blank" className="hover:text-white transition-colors">Instagram</a>
            <a href="https://tiktok.com/@heybalkan.app" target="_blank" className="hover:text-white transition-colors">TikTok</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer.contact}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer.imprint}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
