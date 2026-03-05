import React, { useState } from 'react';
import { Heart, Users, Shield, Sparkles, Check, ArrowRight, Instagram, MessageCircle, Send } from 'lucide-react';

export default function HeyBalkanLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [origin, setOrigin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

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
            <a href="https://instagram.com/heybalkan.app" target="_blank" className="text-white/80 hover:text-white transition-colors">
              <Instagram size={24} />
            </a>
            <a href="https://tiktok.com/@heybalkan.app" target="_blank" className="text-white/80 hover:text-white transition-colors text-xl">
              📱
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
            Coming Soon – Spring 2026
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Hey Balkan! 👋
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-4 leading-relaxed">
            Die erste Dating-App für die <span className="font-bold">Balkan-Diaspora</span> in der Schweiz, Deutschland & Österreich.
          </p>
          
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
            Finde jemanden, der deine Kultur versteht – ohne stundenlange Erklärungen.
          </p>

          {/* Signup Form */}
          {!submitted ? (
            <div className="max-w-lg mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Deine Email-Adresse"
                  className="flex-1 px-6 py-4 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg bg-white/95 backdrop-blur"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Notify me <Send size={18} />
                </button>
              </form>
              
              <div className="mt-5">
                <p className="text-white/70 text-sm mb-3">Woher kommst du ursprünglich?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { flag: '🇷🇸', name: 'Srbija' },
                    { flag: '🇭🇷', name: 'Hrvatska' },
                    { flag: '🇧🇦', name: 'BiH' },
                    { flag: '🇲🇪', name: 'Crna Gora' },
                    { flag: '🇲🇰', name: 'Makedonija' },
                    { flag: '🇽🇰', name: 'Kosovo' },
                    { flag: '🇸🇮', name: 'Slovenija' }
                  ].map((country) => (
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
              <h3 className="text-2xl font-bold text-white mb-2">Hvala ti!</h3>
              <p className="text-white/90 mb-6">
                Du bist auf der Warteliste! Wir melden uns, sobald Hey Balkan live geht.
              </p>
              <p className="text-white/70 text-sm mb-4">
                Frühe User bekommen <span className="font-bold text-white">3 Monate Premium gratis!</span>
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a href="#" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Instagram size={18} /> Follow @heybalkan.app
                </a>
              </div>
            </div>
          )}

          <p className="text-white/60 text-sm mt-8">
            <span className="text-white font-bold">3.241</span> Menschen bereits auf der Warteliste
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
          <h2 className="text-4xl font-black text-stone-800 mb-4">
            Warum Hey Balkan?
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Von Balkan-Menschen entwickelt, für Balkan-Menschen. 
            Wir verstehen, was dir wirklich wichtig ist.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="text-indigo-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">Kulturelle Matches</h3>
            <p className="text-stone-600 leading-relaxed">
              Finde jemanden, der weiss was "ajde" bedeutet, warum Familienessen 5 Stunden dauern, 
              und dass Kaffee eine Lebenseinstellung ist ☕
            </p>
          </div>

          {/* Feature 2 - Porodica Mode */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-purple-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
              ✨ EINZIGARTIG
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-purple-700" size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">Porodica-Modus 👩‍👦</h3>
            <p className="text-stone-600 leading-relaxed">
              <span className="font-medium">Optional:</span> Lass deine Mama Profile vorschlagen! Sie kann sehen (aber nicht chatten) 
              und dir Matches empfehlen. Endlich eine App, die sie gutheissen würde 😄
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="text-emerald-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">Verifizierte Profile</h3>
            <p className="text-stone-600 leading-relaxed">
              Selfie-Verifizierung gegen Fake-Profile. Du triffst echte Menschen, keine Catfish. 
              Bei uns zählt Authentizität 💯
            </p>
          </div>
        </div>
      </div>

      {/* Countries Section */}
      <div className="bg-gradient-to-br from-stone-100 to-stone-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-stone-800 mb-4">
            Für alle aus der Region
          </h2>
          <p className="text-stone-600 mb-12">
            Egal ob du aus Serbien, Kroatien, Bosnien, Montenegro, Mazedonien, Kosovo oder Slowenien kommst – bei uns bist du zuhause.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['🇷🇸 Srbija', '🇭🇷 Hrvatska', '🇧🇦 Bosna i Hercegovina', '🇲🇪 Crna Gora', '🇲🇰 Severna Makedonija', '🇽🇰 Kosovo', '🇸🇮 Slovenija'].map((country) => (
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
          <h2 className="text-3xl font-black text-stone-800 mb-12 text-center">
            Das sagen unsere Beta-Tester
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  M
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-lg">Milica, 28</p>
                  <p className="text-stone-500">Zürich • 🇷🇸</p>
                </div>
              </div>
              <p className="text-stone-600 text-lg leading-relaxed">
                "Endlich eine App wo ich nicht erklären muss, warum ich nicht 'einfach jemanden' date. 
                Die Leute hier verstehen, dass <span className="font-medium">Herkunft wichtig ist</span> – ohne es weird zu machen."
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-lg">Ante, 32</p>
                  <p className="text-stone-500">München • 🇭🇷</p>
                </div>
              </div>
              <p className="text-stone-600 text-lg leading-relaxed">
                "Der Porodica-Modus ist genial! Meine Mama hat mir tatsächlich jemanden vorgeschlagen 
                und wir sind jetzt seit 3 Monaten zusammen. <span className="font-medium">Danke Mama, danke Hey Balkan!</span> 😂"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-stone-800 mb-12 text-center">
            So funktioniert's
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, emoji: "📝", title: "Profil erstellen", desc: "Herkunft, Sprachen, was du suchst" },
              { step: 2, emoji: "👆", title: "Swipen", desc: "Like Profile die dir gefallen" },
              { step: 3, emoji: "💬", title: "Chatten", desc: "Match? Los geht's!" },
              { step: 4, emoji: "👨‍👩‍👧", title: "Porodica", desc: "Optional: Mama darf helfen 😄" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.emoji}
                </div>
                <div className="text-sm text-indigo-600 font-bold mb-1">Schritt {item.step}</div>
                <h3 className="font-bold text-stone-800 mb-1">{item.title}</h3>
                <p className="text-stone-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 py-20 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-4xl font-black text-white mb-6">
            Bereit für Hey Balkan?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Sei unter den Ersten wenn wir launchen.<br/>
            <span className="font-bold">Frühe User: 3 Monate Premium gratis!</span>
          </p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine Email-Adresse"
                className="flex-1 px-6 py-4 rounded-2xl text-lg focus:outline-none shadow-lg"
                required
              />
              <button
                type="submit"
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all whitespace-nowrap"
              >
                Ich bin dabei! 🚀
              </button>
            </form>
          ) : (
            <div className="text-white text-xl flex items-center justify-center gap-2">
              <Check className="text-green-300" /> Du bist dabei! Check deine Inbox.
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
          <p className="text-sm text-center md:text-left">
            © 2026 Hey Balkan. Made with ❤️ in Switzerland.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">TikTok</a>
            <a href="#" className="hover:text-white transition-colors">Kontakt</a>
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
