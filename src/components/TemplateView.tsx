'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Save, Check, Smartphone, Send, Sparkles } from 'lucide-react';

interface WaveTemplate {
  id: number;
  wave_number: number;
  title: string;
  scheduled_date: string;
  default_message_template: string;
}

export default function TemplateView() {
  const [waves, setWaves] = useState<WaveTemplate[]>([]);
  const [activeWaveId, setActiveWaveId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<string>('');
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchWaves();
  }, []);

  const fetchWaves = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/waves');
      const data = await res.json();
      if (data.success && data.waves.length > 0) {
        setWaves(data.waves);
        const first = data.waves.find((w: any) => w.id === activeWaveId) || data.waves[0];
        setActiveWaveId(first.id);
        setCurrentTemplate(first.default_message_template);
        setCurrentTitle(first.title);
        setCurrentDate(first.scheduled_date);
      }
    } catch (err) {
      console.error('Error fetching waves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWave = (w: WaveTemplate) => {
    setActiveWaveId(w.id);
    setCurrentTemplate(w.default_message_template);
    setCurrentTitle(w.title);
    setCurrentDate(w.scheduled_date);
    setSavedSuccess(false);
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    setCurrentTemplate((prev) => prev + placeholder);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`/api/waves/${activeWaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          scheduled_date: currentDate,
          default_message_template: currentTemplate
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setWaves(prev => prev.map(w => w.id === activeWaveId ? { ...w, title: currentTitle, scheduled_date: currentDate, default_message_template: currentTemplate } : w));
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setSaving(false);
    }
  };

  const previewText = currentTemplate
    .replace(/{nama}/g, 'Bpk. / Ibu Alumni')
    .replace(/{panitia}/g, 'Charlie Nainggolan');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Template Pesan WhatsApp
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sesuaikan redaksi pesan broadcast untuk masing-masing gelombang.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Tersimpan ke Database' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>

        {/* Wave Tabs */}
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {waves.map((w) => {
              const isActive = activeWaveId === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => handleSelectWave(w)}
                  className={`p-3 rounded-xl text-left border transition ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`text-[10px] uppercase font-bold ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    Wave {w.wave_number} • {w.scheduled_date}
                  </div>
                  <div className="font-semibold text-xs sm:text-sm mt-0.5 truncate">{w.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Broadcast</label>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jadwal Tanggal</label>
            <input
              type="text"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase">Isi Pesan WhatsApp</label>
              <span className="text-[11px] text-slate-400">Variabel dinamis:</span>
            </div>

            {/* Placeholder Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => handleInsertPlaceholder('{nama}')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-semibold border border-blue-200 transition"
              >
                + &#123;nama&#125; (Nama Jemaat)
              </button>
              <button
                type="button"
                onClick={() => handleInsertPlaceholder('{panitia}')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold border border-slate-200 transition"
              >
                + &#123;panitia&#125; (Nama Panitia)
              </button>
            </div>

            <textarea
              rows={16}
              value={currentTemplate}
              onChange={(e) => setCurrentTemplate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm bg-slate-100 rounded-[32px] p-3 border-4 border-slate-300 shadow-xl">
            {/* Phone Notch */}
            <div className="flex justify-center mb-2">
              <div className="w-20 h-3.5 bg-slate-300 rounded-full" />
            </div>

            {/* WA Header */}
            <div className="bg-[#075E54] text-white px-3 py-2.5 rounded-t-2xl flex items-center space-x-2.5 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-700 border border-emerald-400/40 flex items-center justify-center font-bold text-xs">
                P
              </div>
              <div className="truncate flex-1">
                <div className="font-bold text-xs truncate">Panitia Natal PAKSU</div>
                <div className="text-[10px] text-emerald-100">Online</div>
              </div>
            </div>

            {/* WA Chat Body */}
            <div className="bg-[#EFEAE2] p-3 min-h-[460px] max-h-[500px] overflow-y-auto space-y-3">
              <div className="text-center">
                <span className="px-2 py-0.5 rounded-full bg-white/80 text-[10px] text-slate-500 shadow-2xs">
                  HARI INI
                </span>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[88%] bg-[#E7FFDB] text-slate-900 rounded-2xl rounded-tr-xs p-3 text-xs leading-relaxed shadow-xs relative whitespace-pre-line font-sans border border-[#cbebb9]">
                  {previewText}
                  <div className="mt-1 text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                    <span>17:00</span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WA Input Bar */}
            <div className="bg-slate-200 p-2 rounded-b-2xl flex items-center space-x-2 text-slate-400 text-xs">
              <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-slate-400">
                Ketik pesan...
              </div>
              <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 text-center flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>Simulasi tampilan WhatsApp di HP jemaat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
