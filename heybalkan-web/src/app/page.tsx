'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/app/discover');
      } else {
        router.replace('/auth/login');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700">
      <div className="text-center">
        <p className="text-6xl mb-4">👋</p>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Hey Balkan!</h1>
        <p className="text-white/70 mt-2">Loading...</p>
      </div>
    </div>
  );
}
