'use client';

import { useRef, useState } from 'react';
import { BadgeCheck, Camera, Clock, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

const MAX_SELFIE_BYTES = 10 * 1024 * 1024;

interface VerificationSectionProps {
  userId: string;
  status: string | null | undefined;
  onStatusChange: (status: string) => void;
}

export default function VerificationSection({ userId, status, onStatusChange }: VerificationSectionProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selfie, setSelfie] = useState<{ file: File; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const current = status || 'none';

  const clearSelfie = () => {
    if (selfie) URL.revokeObjectURL(selfie.preview);
    setSelfie(null);
  };

  const close = () => {
    clearSelfie();
    setError('');
    setSubmitted(false);
    setOpen(false);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    if (file.size > MAX_SELFIE_BYTES) {
      setError(t('errorFileTooLarge'));
      return;
    }
    setError('');
    clearSelfie();
    setSelfie({ file, preview: URL.createObjectURL(file) });
  };

  const handleSubmit = async () => {
    if (!selfie || busy) return;
    setBusy(true);
    setError('');

    const ext = (selfie.file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${userId}/selfie_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('verifications')
      .upload(path, selfie.file, { contentType: selfie.file.type || 'image/jpeg' });

    if (uploadError) {
      setBusy(false);
      setError(t('errorGeneral'));
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('request_verification');
    setBusy(false);

    if (rpcError) {
      setError(t('errorGeneral'));
      return;
    }

    clearSelfie();
    setSubmitted(true);
    onStatusChange(typeof data === 'string' ? data : 'pending');
  };

  return (
    <div className="px-6 py-5 border-b border-slate-800">
      <h3 className="text-white font-semibold mb-3">{t('verification')}</h3>

      {current === 'verified' && (
        <div className="flex items-center gap-3 text-sm">
          <BadgeCheck size={22} className="text-sky-400" />
          <span className="text-slate-300">{t('verifiedHint')}</span>
        </div>
      )}

      {current === 'pending' && (
        <div className="flex items-center gap-3 text-sm">
          <Clock size={20} className="text-amber-400" />
          <span className="text-slate-300">{t('verificationPending')}</span>
        </div>
      )}

      {(current === 'none' || current === 'rejected') && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            {current === 'rejected' ? t('verificationRejected') : t('verificationNone')}
          </p>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sky-500 transition text-sm"
          >
            <BadgeCheck size={18} />
            {t('verifyNow')}
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            className="bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{t('verification')}</h2>
              <button onClick={close} aria-label={t('close')} className="text-slate-400 hover:text-white transition">
                <X size={22} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center space-y-4 py-2">
                <Clock size={36} className="text-amber-400 mx-auto" />
                <p className="text-slate-200">{t('verificationSubmitted')}</p>
                <button
                  onClick={close}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition"
                >
                  {t('close')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">{t('verifyIntro')}</p>
                <p className="text-slate-500 text-xs">🔒 {t('verifySelfiePrivate')}</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleSelect}
                  className="hidden"
                />

                {selfie ? (
                  <img src={selfie.preview} alt="" className="w-full max-h-80 object-contain rounded-2xl bg-slate-900" />
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-900/50 hover:border-sky-500 transition"
                  >
                    <span className="text-4xl mb-2">✌️</span>
                    <span className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                      <Camera size={18} /> {t('takeSelfie')}
                    </span>
                  </button>
                )}

                {error && <p className="text-red-400 text-sm">{error}</p>}

                {selfie && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl hover:bg-slate-600 transition"
                    >
                      {t('retakeSelfie')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={busy}
                      className="flex-[2] bg-sky-600 text-white font-bold py-3 rounded-xl hover:bg-sky-500 transition disabled:opacity-50"
                    >
                      {busy ? '...' : t('submitVerification')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
