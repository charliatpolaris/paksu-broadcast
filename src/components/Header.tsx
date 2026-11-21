'use client';

import React, { useState, useEffect } from 'react';
import { Send, BarChart3, Users, FileText, Image as ImageIcon, User, LogOut, ChevronRight, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'panitia' | 'dashboard' | 'recipients' | 'templates' | 'tutorial';
  setActiveTab: (tab: 'panitia' | 'dashboard' | 'recipients' | 'templates' | 'tutorial') => void;
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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        {/* Top micro bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-3 sm:px-4 py-1 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
            <span className="font-bold text-slate-700">PAKSU 2026</span>
            <span>•</span>
            <span className="truncate text-slate-600 hidden sm:inline">Ibadah Natal 12 Des 2026 (Gedung Seminar AB UKI)</span>
            <span className="truncate text-slate-600 sm:hidden">Natal 12 Des 2026</span>
            <span className="hidden lg:inline px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold">
              CHRIST'S AMBASSADOR
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded">
              H-{countdownDays}
            </span>
            <button
              onClick={onOpenFlyer}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <ImageIcon className="w-3 h-3" /> Info Acara
            </button>
          </div>
        </div>

        {/* Main navigation bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
          >
            <img 
              src="/logo.png" 
              alt="Logo Yayasan PAKSU" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-xs" 
            />
            <div>
              <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight group-hover:text-blue-600 transition">
                PAKSU <span className="font-light text-slate-500">Broadcast</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Monitoring WA Blast Natal</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
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

            <button
              onClick={() => setActiveTab('tutorial')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'tutorial'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Tutorial</span>
            </button>
          </nav>

          {/* User Sign In Status */}
          <div className="flex items-center space-x-2">
            {signedInPanitia ? (
              <div className="flex items-center space-x-2 bg-slate-100/90 border border-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                  {signedInPanitia.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-900 max-w-[90px] sm:max-w-[160px] truncate leading-tight">
                    {signedInPanitia.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[90px] sm:max-w-none">{signedInPanitia.group_name}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="ml-0.5 p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 rounded transition"
                  title="Ganti nama panitia"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In Panitia</span>
                <span className="sm:hidden">Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'dashboard'
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Monitoring</span>
        </button>

        <button
          onClick={() => setActiveTab('panitia')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition relative ${
            activeTab === 'panitia'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <Send className={`w-5 h-5 ${activeTab === 'panitia' ? 'text-emerald-600' : 'text-slate-400'}`} />
            {!signedInPanitia && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Kirim WA</span>
        </button>

        <button
          onClick={() => setActiveTab('recipients')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'recipients'
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'recipients' ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Jemaat</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'templates'
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'templates' ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Template</span>
        </button>

        <button
          onClick={() => setActiveTab('tutorial')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'tutorial'
              ? 'text-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'tutorial' ? 'text-amber-500' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Tutorial</span>
        </button>
      </nav>
    </>
  );
}
