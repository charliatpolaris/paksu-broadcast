'use client';

import React, { useState } from 'react';
import { X, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface PanitiaMember {
  id: number;
  name: string;
  group_name: string;
  phone?: string;
  total_assigned?: number;
}

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (panitia: PanitiaMember) => void;
}

export default function SignInModal({ isOpen, onClose, onSignIn }: SignInModalProps) {
  const [typedName, setTypedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryName = typedName.trim().toLowerCase();
    if (!queryName) {
      setErrorMessage('Silakan ketik nama Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/panitia');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Gagal memuat data panitia.');
      }

      const panitiaList: PanitiaMember[] = data.panitia || [];

      // Exact match (case insensitive)
      let found = panitiaList.find(
        (p) => p.name.trim().toLowerCase() === queryName
      );

      // If no exact match, try matching if input contains full name or vice versa with high confidence
      if (!found) {
        const partialMatches = panitiaList.filter(
          (p) =>
            p.name.trim().toLowerCase().includes(queryName) ||
            queryName.includes(p.name.trim().toLowerCase())
        );

        if (partialMatches.length === 1) {
          found = partialMatches[0];
        } else if (partialMatches.length > 1) {
          // Check if one starts with query
          const exactPrefix = partialMatches.filter(p => p.name.trim().toLowerCase().startsWith(queryName));
          if (exactPrefix.length === 1) {
            found = exactPrefix[0];
          }
        }
      }

      if (found) {
        onSignIn(found);
        setTypedName('');
        setErrorMessage(null);
        onClose();
      } else {
        setErrorMessage(
          `Nama "${typedName}" tidak ditemukan dalam daftar SK Panitia Natal PAKSU 2026. Pastikan penulisan nama lengkap sesuai SK.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Logo Yayasan PAKSU" 
              className="w-10 h-10 object-contain drop-shadow-xs" 
            />
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                Sign In Panitia Natal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ketik nama Anda sesuai SK Panitia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Pure Input Without Options */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap (Sesuai SK)
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={typedName}
                onChange={(e) => {
                  setTypedName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: Charlie Nainggolan"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Ketik nama lengkap Anda persis seperti yang tercantum pada SK.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !typedName.trim()}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Memeriksa SK...' : 'Masuk ke Portal'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
