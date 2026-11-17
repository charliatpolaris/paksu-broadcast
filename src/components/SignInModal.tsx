'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  const [panitiaList, setPanitiaList] = useState<PanitiaMember[]>([]);

  // Prefetch panitia on modal open for instant 0ms recognition
  useEffect(() => {
    if (isOpen && panitiaList.length === 0) {
      fetch('/api/panitia')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.panitia) {
            setPanitiaList(data.panitia);
          }
        })
        .catch((err) => console.error('Failed to prefetch panitia:', err));
    }
  }, [isOpen, panitiaList.length]);

  // Real-time smart matching based on First Name (since all 27 committee first names are unique)
  const { detectedMatch, ambiguousList } = useMemo(() => {
    const q = typedName.trim().toLowerCase();
    if (!q || panitiaList.length === 0) {
      return { detectedMatch: null, ambiguousList: [] };
    }

    // 1. Exact match on First Name (first word)
    const firstNameExact = panitiaList.filter((p) => {
      const firstName = p.name.trim().split(/\s+/)[0].toLowerCase();
      return firstName === q;
    });
    if (firstNameExact.length === 1) {
      return { detectedMatch: firstNameExact[0], ambiguousList: [] };
    }

    // 2. Exact match on Full Name
    const fullNameExact = panitiaList.filter(
      (p) => p.name.trim().toLowerCase() === q
    );
    if (fullNameExact.length === 1) {
      return { detectedMatch: fullNameExact[0], ambiguousList: [] };
    }

    // 3. First name prefix match (if query is at least 2 chars)
    if (q.length >= 2) {
      const prefixMatches = panitiaList.filter((p) => {
        const firstName = p.name.trim().split(/\s+/)[0].toLowerCase();
        return firstName.startsWith(q);
      });
      if (prefixMatches.length === 1) {
        return { detectedMatch: prefixMatches[0], ambiguousList: [] };
      } else if (prefixMatches.length > 1) {
        return { detectedMatch: null, ambiguousList: prefixMatches };
      }
    }

    // 4. Fallback: full name contains query
    const containsMatches = panitiaList.filter((p) =>
      p.name.trim().toLowerCase().includes(q)
    );
    if (containsMatches.length === 1) {
      return { detectedMatch: containsMatches[0], ambiguousList: [] };
    } else if (containsMatches.length > 1) {
      return { detectedMatch: null, ambiguousList: containsMatches };
    }

    return { detectedMatch: null, ambiguousList: [] };
  }, [typedName, panitiaList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryName = typedName.trim().toLowerCase();
    if (!queryName) {
      setErrorMessage('Silakan ketik nama depan Anda.');
      return;
    }

    // If already detected via live matching
    if (detectedMatch) {
      onSignIn(detectedMatch);
      setTypedName('');
      setErrorMessage(null);
      onClose();
      return;
    }

    // If ambiguous (e.g. typed "Nov" or "El")
    if (ambiguousList.length > 1) {
      const names = ambiguousList.map((p) => p.name.split(' ')[0]).join(', ');
      setErrorMessage(`Ditemukan beberapa nama yang mirip: ${names}. Silakan ketik nama depan lebih lengkap.`);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // If list wasn't preloaded, fetch fresh
      let list = panitiaList;
      if (list.length === 0) {
        const res = await fetch('/api/panitia');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Gagal memuat data panitia.');
        list = data.panitia || [];
        setPanitiaList(list);
      }

      // 1. Exact match on First Name
      let found = list.find(
        (p) => p.name.trim().split(/\s+/)[0].toLowerCase() === queryName
      );

      // 2. Exact match on Full Name
      if (!found) {
        found = list.find((p) => p.name.trim().toLowerCase() === queryName);
      }

      // 3. Prefix on First Name
      if (!found && queryName.length >= 2) {
        const prefixMatches = list.filter((p) =>
          p.name.trim().split(/\s+/)[0].toLowerCase().startsWith(queryName)
        );
        if (prefixMatches.length === 1) {
          found = prefixMatches[0];
        }
      }

      // 4. Contains
      if (!found) {
        const containsMatches = list.filter((p) =>
          p.name.trim().toLowerCase().includes(queryName)
        );
        if (containsMatches.length === 1) {
          found = containsMatches[0];
        }
      }

      if (found) {
        onSignIn(found);
        setTypedName('');
        setErrorMessage(null);
        onClose();
      } else {
        setErrorMessage(
          `Nama depan "${typedName}" tidak ditemukan dalam daftar 27 Panitia SK. Pastikan ejaan nama depan benar.`
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
                Ketik nama depan Anda untuk akses tugas
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Depan Panitia
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
                placeholder="Contoh: Charlie, Novan, Vena, Della..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Cukup ketik nama depan (atau nama lengkap). Sistem otomatis mencocokkan dengan SK.
            </p>
          </div>

          {/* Real-time Match Success Banner */}
          {detectedMatch && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-emerald-950">
                    {detectedMatch.name}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    {detectedMatch.group_name} • Panitia Resmi SK
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ambiguous Suggestions */}
          {ambiguousList.length > 1 && !detectedMatch && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Ada beberapa nama ({ambiguousList.map((p) => p.name.split(' ')[0]).join(', ')}). Lanjutkan ketik nama depan Anda.
              </span>
            </div>
          )}

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
              <span>{loading ? 'Memeriksa...' : 'Masuk ke Portal'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
