'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { removeOwnFolder } from '@/lib/storage';
import { useLanguage } from '@/hooks/useLanguage';

export default function DeleteAccountSection({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState(false);

  const confirmWord = t('deleteAccountConfirmWord');
  const canDelete = confirmText.trim().toUpperCase() === confirmWord;

  const close = () => {
    if (busy) return;
    setOpen(false);
    setConfirmText('');
    setError('');
  };

  const handleDelete = async () => {
    if (!canDelete || busy) return;
    setBusy(true);
    setError('');
    try {
      // 1. Eigene Dateien ueber die Storage-API entfernen (SQL darf das nicht)
      await removeOwnFolder('photos', userId);
      await removeOwnFolder('verifications', userId);

      // 2. Profil + Auth-User loeschen (SECURITY DEFINER RPC)
      const { error: rpcError } = await supabase.rpc('delete_my_account');
      if (rpcError) throw rpcError;

      // 3. Lokale Session verwerfen; der User existiert serverseitig nicht mehr
      await supabase.auth.signOut({ scope: 'local' });
      setDeleted(true);
    } catch {
      setError(t('errorGeneral'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition text-sm mt-6"
      >
        <Trash2 size={16} />
        {t('deleteAccount')}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end sm:items-center justify-center" onClick={deleted ? undefined : close}>
          <div
            role="dialog"
            aria-modal="true"
            className="bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {deleted ? (
              <div className="text-center space-y-5 py-4">
                <p className="text-5xl">👋</p>
                <p className="text-slate-200">{t('accountDeleted')}</p>
                <button
                  onClick={() => router.replace('/')}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition"
                >
                  {t('toHomepage')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">{t('deleteAccount')}</h2>
                  <button onClick={close} aria-label={t('close')} className="text-slate-400 hover:text-white transition">
                    <X size={22} />
                  </button>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{t('deleteAccountHint')}</p>
                <div>
                  <label htmlFor="delete-confirm" className="block text-slate-400 text-xs mb-1.5">
                    {t('deleteAccountConfirmLabel').replace('{word}', confirmWord)}
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    autoComplete="off"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || busy}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500 transition disabled:opacity-40"
                >
                  {busy ? t('deletingAccount') : t('deleteAccountButton')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
