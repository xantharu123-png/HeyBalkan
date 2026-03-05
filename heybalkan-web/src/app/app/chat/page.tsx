'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

interface Conversation {
  matchId: number;
  user: { id: string; first_name: string; photos: string[] };
  lastMessage: { content: string; created_at: string; sender_id: string } | null;
}

export default function ChatListPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      setUid(userId);

      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          id, user1_id, user2_id,
          user1:profiles!matches_user1_id_fkey(id, first_name, photos),
          user2:profiles!matches_user2_id_fkey(id, first_name, photos)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      const convos = await Promise.all(
        (matchData || []).map(async (m: any) => {
          const otherUser = m.user1_id === userId ? m.user2 : m.user1;
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('match_id', m.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          return { matchId: m.id, user: otherUser, lastMessage: lastMsg };
        })
      );

      convos.sort((a, b) => {
        if (a.lastMessage && !b.lastMessage) return -1;
        if (!a.lastMessage && b.lastMessage) return 1;
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        }
        return 0;
      });

      setConversations(convos);
      setLoading(false);
    }
    load();
  }, []);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 60000;
    if (diff < 1) return 'jetzt';
    if (diff < 60) return `${Math.floor(diff)}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-extrabold text-white mb-6">{t('chat')}</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">💬</p>
          <h2 className="text-xl font-bold text-white mb-2">{t('noMessages')}</h2>
          <p className="text-slate-400">{t('noMessagesHint')}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map(c => {
            const photo = c.user?.photos?.[0];
            const isMe = c.lastMessage?.sender_id === uid;
            return (
              <button
                key={c.matchId}
                onClick={() => router.push(`/app/chat/${c.matchId}?name=${c.user?.first_name}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition text-left"
              >
                {photo ? (
                  <img src={photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{c.user?.first_name || 'User'}</p>
                  {c.lastMessage ? (
                    <p className="text-slate-400 text-sm truncate">
                      {isMe ? 'Du: ' : ''}{c.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-indigo-400 text-sm font-medium">{t('newMatch')} 👋</p>
                  )}
                </div>
                {c.lastMessage && (
                  <span className="text-xs text-slate-500">
                    {formatTime(c.lastMessage.created_at)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
