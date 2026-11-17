'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import PanitiaView from '../components/PanitiaView';
import DashboardView from '../components/DashboardView';
import RecipientsView from '../components/RecipientsView';
import TemplateView from '../components/TemplateView';
import SignInModal from '../components/SignInModal';
import FlyerModal from '../components/FlyerModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'panitia' | 'recipients' | 'templates'>('dashboard');
  const [signedInPanitia, setSignedInPanitia] = useState<any>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isFlyerOpen, setIsFlyerOpen] = useState(false);

  // Restore saved sign-in from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('paksu_signed_in_panitia');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSignedInPanitia(parsed);
      }
    } catch (e) {
      console.error('Error loading saved sign in', e);
    }
  }, []);

  const handleSignIn = (panitia: any) => {
    setSignedInPanitia(panitia);
    try {
      localStorage.setItem('paksu_signed_in_panitia', JSON.stringify(panitia));
    } catch (e) {
      console.error(e);
    }
    setActiveTab('panitia');
  };

  const handleSignOut = () => {
    setSignedInPanitia(null);
    try {
      localStorage.removeItem('paksu_signed_in_panitia');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPanitiaFromDashboard = (panitia: any) => {
    if (signedInPanitia && signedInPanitia.id === panitia.id) {
      setActiveTab('panitia');
    } else if (!signedInPanitia) {
      setIsSignInOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'panitia' && !signedInPanitia) {
            setIsSignInOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        signedInPanitia={signedInPanitia}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onSignOut={handleSignOut}
        onOpenFlyer={() => setIsFlyerOpen(true)}
      />

      {/* Main View - Persistent Mounting for 0ms Smooth Tab Switching */}
      <main className="flex-1 pb-16">
        <div className={activeTab === 'dashboard' ? 'block animate-fade-in' : 'hidden'}>
          <DashboardView
            signedInPanitia={signedInPanitia}
            onSelectPanitia={handleSelectPanitiaFromDashboard}
            onOpenFlyer={() => setIsFlyerOpen(true)}
          />
        </div>

        <div className={activeTab === 'panitia' ? 'block animate-fade-in' : 'hidden'}>
          <PanitiaView
            signedInPanitia={signedInPanitia}
            onOpenSignIn={() => setIsSignInOpen(true)}
            onOpenFlyer={() => setIsFlyerOpen(true)}
          />
        </div>

        <div className={activeTab === 'recipients' ? 'block animate-fade-in' : 'hidden'}>
          <RecipientsView
            signedInPanitia={signedInPanitia}
            onOpenSignIn={() => setIsSignInOpen(true)}
          />
        </div>

        <div className={activeTab === 'templates' ? 'block animate-fade-in' : 'hidden'}>
          <TemplateView />
        </div>
      </main>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={handleSignIn}
      />

      {/* Flyer Modal */}
      <FlyerModal isOpen={isFlyerOpen} onClose={() => setIsFlyerOpen(false)} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="font-semibold">Yayasan PAKSU</span>
            <span>•</span>
            <span>Ibadah Natal Keluarga Besar 12 Desember 2026 (Gedung Seminar AB UKI)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Tema: <em>"CHRIST'S AMBASSADOR"</em></span>
            <a
              href="https://paksu.info"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-semibold"
            >
              paksu.info
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
