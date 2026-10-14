'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import SafetyActions from '@/components/SafetyActions';
import VerifiedBadge from '@/components/VerifiedBadge';

interface Message {
  id: number;
  match_id: number;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatPartner {
  id: string;
  first_name: string;
  photos: string[] | null;
  verification_status: string | null;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const matchId = params.matchId as string;
  const userName = searchParams.get('name') || 'Chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uid, setUid] = useState('');
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUid(session.user.id);

      // Match laden: liefert nichts, wenn er nicht existiert oder blockiert ist
      const { data: match } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id')
        .eq('id', matchId)
        .maybeSingle();

      if (!match) {
        setUnavailable(true);
        return;
      }

      const partnerId = match.user1_id === session.user.id ? match.user2_id : match.user1_id;
      const { data: partnerData } = await supabase
        .from('profiles')
        .select('id, first_name, photos, verification_status')
        .eq('id', partnerId)
        .maybeSingle();

      if (!partnerData) {
        setUnavailable(true);
        return;
      }
      setPartner(partnerData);

      // Load messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(100);
      setMessages(data || []);
    }
    init();
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.sender_id !== uid) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId, uid]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic add
    const temp: Message = {
      id: Date.now(),
      match_id: Number(matchId),
      sender_id: uid,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, temp]);

    const { data, error } = await supabase
      .from('messages')
      .insert({ match_id: Number(matchId), sender_id: uid, content })
      .select()
      .single();

    setSending(false);
    if (data) {
      setMessages(prev => prev.map(m => m.id === temp.id ? data : m));
    } else if (error) {
      // z.B. Match nicht mehr verfuegbar (blockiert): Nachricht zuruecknehmen
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      setNewMessage(content);
    }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (unavailable) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 px-8 text-center">
        <p className="text-5xl mb-4">💬</p>
        <p className="text-slate-300 mb-6">{t('chatUnavailable')}</p>
        <button
          onClick={() => router.replace('/app/chat')}
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-500 transition"
        >
          {t('backToChats')}
        </button>
      </div>
    );
  }

  const partnerPhoto = partner?.photos?.[0];

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-300 hover:text-white transition">
          <ChevronLeft size={24} />
        </button>
        {partnerPhoto ? (
          <img src={partnerPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm">👤</div>
        )}
        <span className="font-bold text-white text-lg flex-1 flex items-center gap-1.5 min-w-0">
          <span className="truncate">{partner?.first_name || userName}</span>
          <VerifiedBadge status={partner?.verification_status} size={18} label={t('verified')} />
        </span>
        {partner && (
          <SafetyActions
            targetId={partner.id}
            targetName={partner.first_name}
            context="chat"
            matchId={Number(matchId)}
            onBlocked={() => router.replace('/app/chat')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition"
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === uid;
          const prev = messages[i - 1];
          const showTime = !prev || (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) > 300000;

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="text-center text-xs text-slate-500 my-3">
                  {formatTime(msg.created_at)}
                </p>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t('typeMessage')}
            className="flex-1 bg-slate-900 rounded-full px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition disabled:opacity-40"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
