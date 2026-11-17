'use client';

import React, { useState, useEffect } from 'react';
import { Send, BarChart3, Users, FileText, Image as ImageIcon, User, LogOut, ChevronRight } from 'lucide-react';

interface HeaderProps {
  activeTab: 'panitia' | 'dashboard' | 'recipients' | 'templates';
  setActiveTab: (tab: 'panitia' | 'dashboard' | 'recipients' | 'templates') => void;
  signedInPanitia: { id: number; name: string; group_name: string } | null;
  onOpenSignIn: () => void;
  onSignOut: () => void;
  onOpenFlyer: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  signedInPanitia,
  onOpenSignIn,
  onSignOut,
  onOpenFlyer,
}: HeaderProps) {
  // Countdown to Dec 12, 2026 17:00 WIB
  const [countdownDays, setCountdownDays] = useState(25);

  useEffect(() => {
    const targetDate = new Date('2026-12-12T17:00:00+07:00').getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;
    if (diff > 0) {
      setCountdownDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      {/* Top micro bar */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-1.5 text-xs text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Yayasan PAKSU</span>
          <span>•</span>
          <span className="text-slate-600">Ibadah Natal 12 Des 2026 (Gedung Seminar AB UKI)</span>
          <span className="hidden md:inline px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold">
            CHRIST'S AMBASSADOR
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="font-mono text-[11px] text-slate-600">
            H-{countdownDays} Hari
          </span>
          <button
            onClick={onOpenFlyer}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" /> Info Acara
          </button>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img 
            src="/logo.png" 
            alt="Logo Yayasan PAKSU" 
            className="w-10 h-10 object-contain drop-shadow-xs" 
          />
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight group-hover:text-blue-600 transition">
              PAKSU <span className="font-light text-slate-500">Broadcast</span>
            </h1>
            <p className="text-[11px] text-slate-400">Monitoring WA Blast Natal 2026</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 order-3 sm:order-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Monitoring Progres</span>
          </button>

          <button
            onClick={() => setActiveTab('panitia')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition relative ${
              activeTab === 'panitia'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Kirim Pesan (Tugas Saya)</span>
            {!signedInPanitia && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('recipients')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === 'recipients'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Jemaat</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === 'templates'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Template WA</span>
          </button>
        </nav>

        {/* User Sign In Status */}
        <div className="order-2 sm:order-3 flex items-center space-x-2">
          {signedInPanitia ? (
            <div className="flex items-center space-x-2 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                {signedInPanitia.name.charAt(0)}
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-900 max-w-[130px] sm:max-w-[160px] truncate leading-tight">
                  {signedInPanitia.name}
                </div>
                <div className="text-[10px] text-slate-500">{signedInPanitia.group_name}</div>
              </div>
              <button
                onClick={onSignOut}
                className="ml-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 rounded transition"
                title="Ganti nama panitia"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In Panitia</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
