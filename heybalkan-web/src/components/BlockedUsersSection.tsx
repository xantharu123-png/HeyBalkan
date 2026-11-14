'use client';

import { useEffect, useState } from 'react';
import { Ban } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

interface BlockedUser {
  blocked_id: string;
  first_name: string | null;
  blocked_at: string;
}

export default function BlockedUsersSection({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const [blocked, setBlocked] = useState<BlockedUser[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Profile Blockierter sind per RLS ausgeblendet, daher Namen per RPC
    supabase.rpc('get_my_blocks').then(({ data, error: rpcError }) => {
      setBlocked(rpcError ? [] : ((data || []) as BlockedUser[]));
    });
  }, []);

  const handleUnblock = async (entry: BlockedUser) => {
    const name = entry.first_name || '–';
    if (busyId || !confirm(t('unblockConfirm').replace('{name}', name))) return;
    setBusyId(entry.blocked_id);
    setError('');

    const { error: deleteError } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_id', entry.blocked_id);

    setBusyId(null);
    if (deleteError) {
      setError(t('errorGeneral'));
      return;
    }
    setBlocked(prev => (prev || []).filter(b => b.blocked_id !== entry.blocked_id));
  };

  if (blocked === null) return null;

  return (
    <div className="px-6 py-5 border-b border-slate-800">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Ban size={16} className="text-slate-400" />
        {t('blockedUsers')}
        {blocked.length > 0 && <span className="text-slate-500 text-sm font-normal">({blocked.length})</span>}
      </h3>

      {blocked.length === 0 ? (
        <p className="text-sm text-slate-500">{t('noBlockedUsers')}</p>
      ) : (
        <ul className="space-y-2">
          {blocked.map(entry => (
            <li key={entry.blocked_id} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-medium truncate">{entry.first_name || '–'}</p>
                <p className="text-slate-500 text-xs">
                  {t('blockedOn').replace('{date}', new Date(entry.blocked_at).toLocaleDateString())}
                </p>
              </div>
              <button
                onClick={() => handleUnblock(entry)}
                disabled={busyId === entry.blocked_id}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50"
              >
                {busyId === entry.blocked_id ? '...' : t('unblock')}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
