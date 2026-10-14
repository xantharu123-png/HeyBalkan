'use client';

import { useState } from 'react';
import { MoreHorizontal, Flag, Ban, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

type Context = 'discover' | 'match' | 'chat';
type Step = 'menu' | 'report' | 'block' | 'done';

const REASONS = [
  { key: 'fake_profile', labelKey: 'reasonFake' },
  { key: 'inappropriate_content', labelKey: 'reasonInappropriate' },
  { key: 'harassment', labelKey: 'reasonHarassment' },
  { key: 'spam_scam', labelKey: 'reasonSpam' },
  { key: 'underage', labelKey: 'reasonUnderage' },
  { key: 'other', labelKey: 'reasonOther' },
];

interface SafetyActionsProps {
  targetId: string;
  targetName: string;
  context: Context;
  matchId?: number;
  onBlocked?: () => void;
  className?: string;
}

export default function SafetyActions({ targetId, targetName, context, matchId, onBlocked, className }: SafetyActionsProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('menu');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [doneMessage, setDoneMessage] = useState('');
  const [didBlock, setDidBlock] = useState(false);

  const n = (key: string) => t(key).replace('{name}', targetName);

  const reset = () => {
    setStep('menu');
    setReason('');
    setDetails('');
    setAlsoBlock(true);
    setError('');
    setDoneMessage('');
    setDidBlock(false);
  };

  const close = () => {
    setOpen(false);
    if (didBlock) onBlocked?.();
    reset();
  };

  const block = async (uid: string) => {
    const { error: blockError } = await supabase
      .from('blocks')
      .insert({ blocker_id: uid, blocked_id: targetId });
    // 23505 = schon blockiert
    if (blockError && blockError.code !== '23505') throw blockError;
  };

  const handleReport = async () => {
    if (!reason || busy) return;
    setBusy(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const uid = session.user.id;

      const { error: reportError } = await supabase.from('reports').insert({
        reporter_id: uid,
        reported_id: targetId,
        match_id: matchId ?? null,
        context,
        reason,
        details: details.trim() || null,
      });
      if (reportError) throw reportError;

      if (alsoBlock) {
        await block(uid);
        setDidBlock(true);
      }
      setDoneMessage(alsoBlock ? `${t('reportSent')} ${n('userBlocked')}` : t('reportSent'));
      setStep('done');
    } catch {
      setError(t('errorGeneral'));
    } finally {
      setBusy(false);
    }
  };

  const handleBlock = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      await block(session.user.id);
      setDidBlock(true);
      setDoneMessage(n('userBlocked'));
      setStep('done');
    } catch {
      setError(t('errorGeneral'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label={t('safetyOptions')}
        className={className ?? 'w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition'}
      >
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                {step === 'report' ? n('reportUser') : step === 'block' ? n('blockUser') : targetName}
              </h2>
              <button onClick={close} aria-label={t('close')} className="text-slate-400 hover:text-white transition">
                <X size={22} />
              </button>
            </div>

            {step === 'menu' && (
              <div className="space-y-2">
                <button
                  onClick={() => setStep('report')}
                  className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl bg-slate-900 text-slate-200 hover:bg-slate-700 transition text-left font-medium"
                >
                  <Flag size={18} className="text-amber-400" />
                  {n('reportUser')}
                </button>
                <button
                  onClick={() => setStep('block')}
                  className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl bg-slate-900 text-red-400 hover:bg-slate-700 transition text-left font-medium"
                >
                  <Ban size={18} />
                  {n('blockUser')}
                </button>
                <button
                  onClick={close}
                  className="w-full py-3 text-slate-400 hover:text-white transition text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            )}

            {step === 'report' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">{t('reportReasonTitle')}</p>
                <div className="space-y-2">
                  {REASONS.map(r => (
                    <button
                      key={r.key}
                      onClick={() => setReason(r.key)}
                      className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition ${
                        reason === r.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {t(r.labelKey)}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-1.5">{t('reportDetails')}</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={t('reportDetailsPlaceholder')}
                    maxLength={1000}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoBlock}
                    onChange={(e) => setAlsoBlock(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500"
                  />
                  {n('alsoBlock')}
                </label>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleReport}
                  disabled={!reason || busy}
                  className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {busy ? '...' : t('sendReport')}
                </button>
              </div>
            )}

            {step === 'block' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">{n('blockConfirmText')}</p>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleBlock}
                  disabled={busy}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500 transition disabled:opacity-50"
                >
                  {busy ? '...' : t('blockConfirm')}
                </button>
                <button
                  onClick={() => setStep('menu')}
                  className="w-full py-2 text-slate-400 hover:text-white transition text-sm"
                >
                  {t('back')}
                </button>
              </div>
            )}

            {step === 'done' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-green-600/20 flex items-center justify-center mx-auto">
                  <Check size={28} className="text-green-400" />
                </div>
                <p className="text-slate-200">{doneMessage}</p>
                <button
                  onClick={close}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition"
                >
                  {t('close')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
