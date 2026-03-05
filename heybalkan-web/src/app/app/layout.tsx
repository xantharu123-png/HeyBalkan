'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { Flame, Heart, MessageCircle, User } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'discover', href: '/app/discover', icon: Flame, labelKey: 'discover' },
  { key: 'matches', href: '/app/matches', icon: Heart, labelKey: 'matches' },
  { key: 'chat', href: '/app/chat', icon: MessageCircle, labelKey: 'chat' },
  { key: 'profile', href: '/app/profile', icon: User, labelKey: 'profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/auth/login');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-4xl mb-2">👋</p>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const isOnboarding = pathname === '/app/onboarding';
  const isChatRoom = pathname.startsWith('/app/chat/');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex-1 pb-16">
        {children}
      </div>

      {/* Bottom Navigation - hide on onboarding and chat room */}
      {!isOnboarding && !isChatRoom && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50">
          <div className="max-w-lg mx-auto flex">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <button
                  key={item.key}
                  onClick={() => router.push(item.href)}
                  className={`flex-1 flex flex-col items-center py-3 transition ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] mt-1 font-medium">{t(item.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
