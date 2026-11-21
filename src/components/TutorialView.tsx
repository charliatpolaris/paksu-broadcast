'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Smartphone, Laptop, Play, Pause, RotateCcw, 
  CheckCircle2, ArrowRight, ExternalLink, MessageSquare, Send, 
  HelpCircle, Lightbulb, Check, ChevronRight, Phone, ShieldCheck, Sparkles, AlertCircle
} from 'lucide-react';

interface TutorialViewProps {
  onGoToPanitia: () => void;
  onOpenSignIn: () => void;
  signedInPanitia: any;
}

export default function TutorialView({
  onGoToPanitia,
  onOpenSignIn,
  signedInPanitia,
}: TutorialViewProps) {
  // Device mode: mobile vs desktop
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  
  // Animation simulation step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Auto-play timer for interactive simulation
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 4200); // 4.2 seconds per step

    return () => clearInterval(timer);
  }, [isPlaying, deviceMode]);

  // Steps description data based on device
  const steps = [
    {
      num: 1,
      title: 'Cari Kontak & Klik Tombol WhatsApp',
      shortTitle: 'Klik Kirim WA',
      descMobile: 'Di tab "Kirim Pesan", temukan jemaat tugas Anda lalu tekan tombol hijau besar "Kirim Pesan WhatsApp".',
      descDesktop: 'Di tab "Kirim Pesan", klik tombol hijau "Kirim Pesan WhatsApp" pada kartu jemaat yang ditugaskan kepada Anda.',
      actionNote: 'Nomor HP tidak perlu disimpan ke kontak buku telepon.',
    },
    {
      num: 2,
      title: deviceMode === 'mobile' ? 'WhatsApp Terbuka Otomatis' : 'Buka WhatsApp Web di Browser',
      shortTitle: deviceMode === 'mobile' ? 'Buka Aplikasi WA' : 'Lanjut ke Chat Web',
      descMobile: 'Smartphone akan langsung membuka aplikasi WhatsApp resmi dan membuka ruang obrolan dengan jemaat.',
      descDesktop: 'Tab baru api.whatsapp.com akan terbuka. Klik tombol hijau "Continue to Chat" lalu pilih "Use WhatsApp Web".',
      actionNote: deviceMode === 'mobile' ? 'Langsung beralih ke WhatsApp tanpa perantara.' : 'Memanfaatkan WhatsApp Web di laptop/PC Anda.',
    },
    {
      num: 3,
      title: 'Pesan Sudah Terisi Otomatis, Tinggal Kirim!',
      shortTitle: 'Pesan Siap Kirim',
      descMobile: 'Teks undangan Natal lengkap dengan nama jemaat & panitia sudah terketik di kolom chat. Cukup tekan tombol Kirim (➤).',
      descDesktop: 'Draft undangan resmi sudah terisi di chatbox WhatsApp Web. Tekan tombol Enter atau tombol Kirim (➤).',
      actionNote: 'Teks sudah dipersonalisasi dengan {nama} dan {panitia}.',
    },
    {
      num: 4,
      title: 'Kembali ke Web & Update Respon',
      shortTitle: 'Update Status & Catatan',
      descMobile: 'Kembali ke portal PAKSU. Status otomatis "Terkirim". Jika jemaat membalas hadir, ubah ke "Konfirmasi Hadir" & catat keterangan.',
      descDesktop: 'Kembali ke tab portal PAKSU. Status kontak otomatis terupdate. Anda dapat memperbarui jika jemaat telah mengonfirmasi.',
      actionNote: 'Progres persen panitia Anda akan langsung bertambah.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Panduan & Tutorial Panitia
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            Cara Mengirim WhatsApp Broadcast Natal PAKSU 2026
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Panduan lengkap langkah demi langkah untuk 27 panitia. Dilengkapi simulasi interaktif untuk perangkat Smartphone (HP) dan WhatsApp Web (Laptop/PC).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {signedInPanitia ? (
            <button
              onClick={onGoToPanitia}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <span>Mulai Tugas Saya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <span>Sign In Panitia</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Device Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 px-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Pilih Perangkat yang Anda Gunakan:</span>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => {
              setDeviceMode('mobile');
              setCurrentStep(1);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              deviceMode === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Smartphone / HP (Aplikasi WA)</span>
          </button>

          <button
            onClick={() => {
              setDeviceMode('desktop');
              setCurrentStep(1);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              deviceMode === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-600" />
            <span>Laptop / PC (WhatsApp Web)</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulation Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-base text-slate-900">
                Simulasi Animasi: {deviceMode === 'mobile' ? 'Pengiriman via HP (WhatsApp App)' : 'Pengiriman via Laptop (WhatsApp Web)'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lihat visualisasi interaktif saat tombol WhatsApp diklik hingga pesan terkirim ke jemaat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              title={isPlaying ? 'Jeda Simulasi' : 'Jalankan Simulasi'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition"
              title="Ulangi dari Langkah 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Progression Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((st) => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            return (
              <button
                key={st.num}
                onClick={() => {
                  setCurrentStep(st.num);
                  setIsPlaying(false);
                }}
                className={`p-3 rounded-xl text-left border transition relative overflow-hidden ${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span className={isActive ? 'text-slate-300' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}>
                    Langkah {st.num}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-xs font-semibold truncate leading-snug">
                  {st.shortTitle}
                </div>
                {isActive && isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 animate-[progress_4.2s_linear_infinite]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Step Highlight Card */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            {currentStep}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-blue-950">
              {steps[currentStep - 1].title}
            </h4>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              {deviceMode === 'mobile' ? steps[currentStep - 1].descMobile : steps[currentStep - 1].descDesktop}
            </p>
            <div className="text-[11px] text-blue-700/80 mt-1 font-medium flex items-center gap-1.5">
              <span>💡</span>
              <span>{steps[currentStep - 1].actionNote}</span>
            </div>
          </div>
        </div>

        {/* Visual Mockup Simulator Box (Mobile vs Desktop) */}
        <div className="flex justify-center py-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 p-4 sm:p-6 overflow-hidden">
          {deviceMode === 'mobile' ? (
            /* ================= MOBILE PHONE SIMULATOR ================= */
            <div className="w-full max-w-xs sm:max-w-sm bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 transition-all duration-300">
              {/* Phone Speaker & Camera Notch */}
              <div className="flex items-center justify-center space-x-2 py-1.5 mb-1">
                <div className="w-12 h-3.5 bg-slate-800 rounded-full" />
                <div className="w-3 h-3 bg-slate-800 rounded-full" />
              </div>

              {/* Screen Canvas */}
              <div className="bg-slate-100 rounded-[28px] overflow-hidden min-h-[460px] max-h-[500px] flex flex-col text-slate-800 relative font-sans shadow-inner">
                {/* Status Bar */}
                <div className="bg-white px-5 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>09:41</span>
                  <div className="flex items-center space-x-1.5">
                    <span>5G</span>
                    <div className="w-4 h-2 bg-slate-600 rounded-2xs" />
                  </div>
                </div>

                {/* FRAME 1: PAKSU PORTAL LIST */}
                {currentStep === 1 && (
                  <div className="flex-1 p-3.5 space-y-3 animate-fade-in bg-slate-50">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
                      <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                      <div>
                        <div className="font-bold text-[11px] text-slate-900">PAKSU Broadcast</div>
                        <div className="text-[9px] text-slate-400">Tugas: Charlie Nainggolan</div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border-2 border-emerald-500 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-900">17. Angel Sinurat</div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">⚪ Belum Terkirim</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">+6281365692479</div>

                      {/* Prominent Clickable WA Button */}
                      <div className="pt-1">
                        <div className="w-full py-2 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs relative">
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pesan WhatsApp</span>
                          {/* Animated Touch Pointer Finger */}
                          <div className="absolute -bottom-2 right-4 w-7 h-7 bg-amber-400/90 rounded-full border-2 border-white flex items-center justify-center text-xs animate-bounce shadow-md">
                            👆
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/70 rounded-xl border border-slate-200 opacity-60 text-xs">
                      <div className="font-bold text-[11px]">18. Bop Siahaan</div>
                      <div className="text-[10px] text-slate-400">+6282165849424</div>
                    </div>
                  </div>
                )}

                {/* FRAME 2: REDIRECT TO WHATSAPP */}
                {currentStep === 2 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fade-in bg-[#075E54] text-white">
                    <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg animate-pulse">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Membuka WhatsApp...</h4>
                      <p className="text-[11px] text-emerald-100 mt-1">
                        Menghubungkan ke nomor +62 813-6569-2479 tanpa perlu menyimpan kontak.
                      </p>
                    </div>
                    <div className="text-[10px] bg-emerald-900/40 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-200">
                      Otomatis dialihkan ke aplikasi WhatsApp
                    </div>
                  </div>
                )}

                {/* FRAME 3: WHATSAPP CHAT WITH PREFILLED DRAFT */}
                {currentStep === 3 && (
                  <div className="flex-1 flex flex-col bg-[#EFEAE2] animate-fade-in">
                    {/* WA Header */}
                    <div className="bg-[#075E54] text-white px-3 py-2 flex items-center space-x-2 shadow-xs">
                      <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                        A
                      </div>
                      <div className="truncate flex-1">
                        <div className="font-bold text-xs truncate">Angel Sinurat</div>
                        <div className="text-[9px] text-emerald-100">+62 813-6569-2479</div>
                      </div>
                    </div>

                    {/* Chat Bubble Area */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col justify-end">
                      <div className="max-w-[92%] self-end bg-[#E7FFDB] rounded-xl rounded-tr-none p-2.5 text-[11px] text-slate-900 shadow-xs border border-[#cbebb9] space-y-1">
                        <div className="font-bold text-[10px] text-emerald-800">Undangan Natal PAKSU 2026</div>
                        <p className="leading-snug">
                          Shalom Kak <strong>Angel Sinurat</strong>, kami mengundang Kakak untuk hadir dalam Ibadah Natal Yayasan PAKSU pada 12 Des 2026 di UKI...
                        </p>
                        <div className="text-[9px] text-slate-400 text-right">
                          Salam, <em>Charlie Nainggolan</em>
                        </div>
                      </div>
                    </div>

                    {/* WA Input Bar with active Send Button */}
                    <div className="bg-slate-200 p-2 flex items-center space-x-2">
                      <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-slate-600 truncate border border-slate-300">
                        Shalom Kak Angel Sinurat, kami mengundang...
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md relative animate-pulse cursor-pointer">
                        <Send className="w-4 h-4 ml-0.5" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-slate-900 font-bold border border-white">
                          👆
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FRAME 4: SUCCESS & UPDATE STATUS */}
                {currentStep === 4 && (
                  <div className="flex-1 p-3.5 space-y-3 animate-fade-in bg-slate-50 flex flex-col justify-center">
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-sm text-emerald-950">Pesan Terkirim ke WhatsApp!</div>
                        <div className="text-[11px] text-emerald-700 mt-0.5">
                          Status jemaat otomatis diperbarui ke portal.
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">Angel Sinurat</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          🟢 Konfirmasi Hadir
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        Catatan: <em>"Hadir berdua bersama suami"</em>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <span className="text-[10px] text-slate-400">Progres: 1 / 18 Jemaat Selesai (6%)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= DESKTOP LAPTOP / BROWSER SIMULATOR ================= */
            <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-2.5 shadow-2xl border border-slate-700 transition-all duration-300">
              {/* Window Titlebar & Tabs */}
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                {/* Browser Tab Pills */}
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <div className={`px-3 py-1 rounded-t-lg transition flex items-center gap-1.5 ${
                    currentStep === 1 || currentStep === 4 ? 'bg-white text-slate-900 font-bold' : 'bg-slate-700 text-slate-300'
                  }`}>
                    <img src="/logo.png" alt="" className="w-3 h-3" />
                    <span>PAKSU Broadcast</span>
                  </div>
                  {(currentStep === 2 || currentStep === 3) && (
                    <div className="px-3 py-1 bg-white text-emerald-800 font-bold rounded-t-lg flex items-center gap-1.5 animate-fade-in">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp Web</span>
                    </div>
                  )}
                </div>
                <div className="w-10" />
              </div>

              {/* Browser Content Area */}
              <div className="bg-slate-100 rounded-xl overflow-hidden min-h-[380px] max-h-[420px] flex flex-col text-slate-800 font-sans shadow-inner">
                {/* URL Address Bar */}
                <div className="bg-white px-4 py-1.5 border-b border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                  <span className="text-slate-400">🔒</span>
                  <span className="font-mono text-[11px] truncate text-slate-700">
                    {currentStep === 2 ? 'https://api.whatsapp.com/send?phone=6281365692479&text=...' : currentStep === 3 ? 'https://web.whatsapp.com' : 'https://paksu-broadcast.vercel.app'}
                  </span>
                </div>

                {/* DESKTOP FRAME 1: PAKSU DASHBOARD */}
                {currentStep === 1 && (
                  <div className="p-6 space-y-4 animate-fade-in bg-slate-50 flex-1">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                      <div>
                        <div className="font-bold text-sm text-slate-900">Tugas Broadcast: Charlie Nainggolan</div>
                        <div className="text-xs text-slate-500">Gelombang 1 • Undangan Awal (22 Nov 2026)</div>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-xs">Group 5</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-2 border-emerald-500 shadow-sm flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-sm text-slate-900">17. Angel Sinurat</div>
                        <div className="text-xs text-slate-500 font-mono">+62 813-6569-2479</div>
                      </div>

                      <div className="flex items-center gap-2 relative">
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pesan WhatsApp</span>
                        </button>
                        <div className="w-7 h-7 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-xs animate-bounce absolute -bottom-3 right-8 shadow-md">
                          👆
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DESKTOP FRAME 2: WA API INTERMEDIATE PAGE */}
                {currentStep === 2 && (
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in bg-white flex-1">
                    <div className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg">
                      <Phone className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">Chat di WhatsApp dengan +62 813-6569-2479</h4>
                      <p className="text-xs text-slate-500 mt-1">Undangan Natal Keluarga Besar Yayasan PAKSU 2026</p>
                    </div>

                    <div className="space-y-2">
                      <button className="px-6 py-2.5 bg-[#25D366] hover:bg-emerald-600 text-white font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2">
                        <span>Lanjut ke Chat (Continue to Chat)</span>
                      </button>
                      <div className="text-[11px] text-slate-500">
                        Belum punya aplikasi? Klik <strong className="text-emerald-700 underline cursor-pointer">Gunakan WhatsApp Web</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* DESKTOP FRAME 3: WA WEB INTERFACE */}
                {currentStep === 3 && (
                  <div className="flex-1 flex animate-fade-in bg-[#EFEAE2]">
                    {/* Left chat sidebar */}
                    <div className="w-48 bg-white border-r border-slate-200 hidden sm:flex flex-col">
                      <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700">Chats</div>
                      <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-xs">
                        <div className="font-bold text-slate-900">Angel Sinurat</div>
                        <div className="text-[10px] text-slate-500 truncate">Draft undangan...</div>
                      </div>
                    </div>

                    {/* Right chat area */}
                    <div className="flex-1 flex flex-col">
                      <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">A</div>
                        <div className="font-bold text-xs">Angel Sinurat (+62 813-6569-2479)</div>
                      </div>

                      <div className="flex-1 p-4 flex flex-col justify-end">
                        <div className="max-w-[75%] self-end bg-[#E7FFDB] p-3 rounded-2xl rounded-tr-none text-xs text-slate-900 shadow-xs border border-[#cbebb9] space-y-1">
                          <div className="font-bold text-emerald-800">🎄 IBADAH NATAL KELUARGA BESAR YAYASAN PAKSU 🎄</div>
                          <p className="text-[11px] leading-relaxed">
                            Shalom Kak Angel Sinurat, kami mengundang Kakak hadir pada Sabtu, 12 Des 2026 di UKI...
                          </p>
                          <div className="text-[10px] text-slate-400 text-right">Tekan Enter untuk kirim ➤</div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-200 flex items-center space-x-2">
                        <div className="flex-1 bg-white rounded-xl px-4 py-2 text-xs text-slate-700 border border-slate-300">
                          Shalom Kak Angel Sinurat, kami mengundang Kakak...
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center cursor-pointer shadow-sm">
                          <Send className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DESKTOP FRAME 4: SUCCESS IN PORTAL */}
                {currentStep === 4 && (
                  <div className="p-6 space-y-4 animate-fade-in bg-slate-50 flex-1">
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">✓</div>
                        <div>
                          <div className="font-bold text-sm text-emerald-950">Broadcast Berhasil Terkirim ke WhatsApp</div>
                          <div className="text-xs text-emerald-700">Telah tercatat di database live Neon PostgreSQL</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-200/80 text-emerald-900 font-bold rounded-full text-xs">
                        Status: Terkirim
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">Angel Sinurat</div>
                        <div className="text-slate-500 text-[11px]">Catatan: Hadir bersama keluarga</div>
                      </div>
                      <select className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs">
                        <option>🟢 Konfirmasi Hadir</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Step-by-Step Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">
            Panduan Lengkap Langkah Kerja Panitia
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Sign In dengan Nama Depan
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Klik tombol <strong>Sign In Panitia</strong> di sudut kanan atas. Cukup ketik nama depan Anda (contoh: <em>Charlie</em>, <em>Novan</em>, <em>Vena</em>, <em>Della</em>). Sistem langsung memvalidasi dengan SK dan memuat 17–18 jemaat tugas Anda.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Pilih Gelombang Broadcast (Wave)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tersedia 3 gelombang terencana: <strong>Wave 1 (22 Nov - Undangan Awal)</strong>, <strong>Wave 2 (29 Nov - Reminder)</strong>, dan <strong>Wave 3 (6 Des - Final H-6)</strong>. Pilih gelombang yang sedang berlangsung di tab atas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              1-Klik Kirim WhatsApp per Jemaat
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tekan tombol hijau <strong>Kirim Pesan WhatsApp</strong>. WhatsApp akan langsung terbuka dengan pesan yang sudah otomatis disesuaikan dengan nama jemaat & panitia pengirim. Cukup tekan tombol Kirim di WhatsApp!
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Perbarui Status & Catatan Respon
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah dikirim, status otomatis ditandai <em>Terkirim Tidak Ada Respond</em>. Saat jemaat membalas, ganti status ke <strong>Konfirmasi Hadir</strong> atau <strong>Tidak Bisa Hadir</strong> serta tulis catatan (misal: "Bawa anak", "Dinas luar kota").
            </p>
          </div>
        </div>
      </div>

      {/* Difference Mobile vs Desktop WhatsApp */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Perbandingan Perangkat</span>
          <h3 className="text-lg sm:text-xl font-bold">Kirim via Smartphone (HP) vs Laptop (WhatsApp Web)</h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Sistem dirancang fleksibel sehingga Anda bisa menyebarkan broadcast dari perangkat mana saja yang paling nyaman.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <Smartphone className="w-4 h-4" />
              <span>Kelebihan Menggunakan Smartphone (HP)</span>
            </div>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Lebih Cepat:</strong> Langsung melompat ke aplikasi WhatsApp yang sudah terinstal tanpa jeda browser.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Desain Tombol Jempol:</strong> Tombol "Kirim Pesan WhatsApp" memenuhi lebar layar HP sehingga mudah ditap berkali-kali.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Bisa Dilakukan di Mana Saja:</strong> Sambil beraktivitas tanpa perlu membuka laptop.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
              <Laptop className="w-4 h-4" />
              <span>Kelebihan Menggunakan Laptop / PC</span>
            </div>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Layar Luas:</strong> Nyaman untuk melihat tabel 480 jemaat secara keseluruhan dan monitoring leaderboard.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Mengetik Catatan Lebih Cepat:</strong> Mengetik keterangan respon jemaat yang panjang lebih leluasa menggunakan keyboard fisik.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Tab:</strong> Bisa membuka tab monitoring progres berdampingan dengan WhatsApp Web.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ & Troubleshooting */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-base text-slate-900">Pertanyaan Umum (FAQ) & Tips Panitia</h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Apakah saya harus menyimpan 18 nomor jemaat ke kontak telepon saya terlebih dahulu?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Tidak perlu sama sekali!</strong> Sistem telah menggunakan teknologi WhatsApp Deep Link (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">wa.me</code>). Begitu tombol diklik, WhatsApp akan langsung membuka ruang chat dengan nomor tersebut meskipun belum disimpan di kontak HP Anda.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Apakah nomor jemaat bisa tertukar dengan panitia lain?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Tidak.</strong> Ke-480 jemaat telah dibagi secara merata (~17-18 jemaat per panitia) dan terkunci sesuai SK. Setiap jemaat hanya ditugaskan ke satu panitia PIC resmi.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Mengapa saya tidak bisa mengedit status jemaat milik panitia lain?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Sistem dilengkapi fitur keamanan otorisasi (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">403 Forbidden</code>). Hanya panitia PIC yang bertugas yang berhak mengubah status jemaatnya demi mencegah data tertimpa atau terhapus secara tidak sengaja.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Bagaimana jika nomor WhatsApp jemaat tidak aktif atau salah sambung?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Ubah status jemaat tersebut di dropdown menjadi <strong>Tidak Terkirim (Gagal)</strong> dan tuliskan keterangan di kolom catatan (misal: "Nomor tidak terdaftar di WA"). Tim sekretariat akan membantu mencarikan nomor alternatif.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Bagaimana jika jemaat membalas bahwa mereka akan hadir bersama keluarga?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Ubah status jemaat menjadi <strong>Konfirmasi Hadir</strong> dan ketik di kolom keterangan (misal: <em>"Hadir bawa 2 orang anak & istri"</em>). Data ini akan sangat membantu divisi konsumsi dan acara dalam mempersiapkan tempat duduk.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center py-6">
        <button
          onClick={onGoToPanitia}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-md transition"
        >
          <Send className="w-4 h-4" />
          <span>Buka Tugas Broadcast Saya Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
