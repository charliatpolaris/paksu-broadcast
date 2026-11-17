'use client';

import React from 'react';
import { X, Calendar, Clock, MapPin, User, Download, ExternalLink } from 'lucide-react';

interface FlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FlyerModal({ isOpen, onClose }: FlyerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-base text-slate-900">Detail Ibadah Natal Yayasan PAKSU 2026</h3>
            <p className="text-xs text-slate-500">CHRIST'S AMBASSADOR • 12 Desember 2026</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-h-[80vh] overflow-y-auto">
          {/* Left: Flyer Image */}
          <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <img
              src="/flyer.jpg"
              alt="Flyer Natal PAKSU 2026"
              className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-sm object-contain border border-slate-200"
            />
            <div className="mt-4 flex gap-3 w-full max-w-xs">
              <a
                href="/flyer.jpg"
                download="Flyer_Natal_PAKSU_2026.jpg"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" /> Download Flyer
              </a>
              <a
                href="/flyer.jpg"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs transition"
                title="Buka gambar penuh"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Event Information */}
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Tema Ibadah</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">"CHRIST'S AMBASSADOR"</h2>
              <p className="mt-2 text-xs italic text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                “Tetapi kamulah bangsa yang terpilih, ... umat kepunyaan Allah sendiri, supaya kamu memberitakan perbuatan-perbuatan yang besar dari Dia.”
                <span className="block font-semibold text-slate-800 mt-1">— 1 Petrus 2:9</span>
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200">
                <User className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-[11px] text-slate-400">Pembicara Firman</div>
                  <div className="font-bold text-slate-900 text-sm">Pdt. Alex Nanlohy</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200">
                <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <div className="text-[11px] text-slate-400">Hari & Tanggal</div>
                  <div className="font-bold text-slate-900">Sabtu, 12 Desember 2026</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200">
                <Clock className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <div className="text-[11px] text-slate-400">Waktu Pelaksanaan</div>
                  <div className="font-bold text-slate-900">Pukul 17.00 WIB (Open Gate 16.30 WIB)</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200">
                <MapPin className="w-4 h-4 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[11px] text-slate-400">Lokasi Acara</div>
                  <div className="font-bold text-slate-900">Gedung Seminar AB UKI, Jakarta Timur</div>
                  <a
                    href="https://maps.google.com/?q=Gedung+Seminar+AB+UKI+Jakarta+Timur"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Buka Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Wave Timeline */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Jadwal 3 Tahap Broadcast Message
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="font-medium text-slate-800">Wave 1: Undangan Awal</span>
                  <span className="font-mono font-bold text-slate-600">22 Nov 2026</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="font-medium text-slate-800">Wave 2: Follow-Up & Reminder</span>
                  <span className="font-mono font-bold text-slate-600">29 Nov 2026</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="font-medium text-slate-800">Wave 3: Final Countdown H-6</span>
                  <span className="font-mono font-bold text-slate-600">6 Des 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <span>Yayasan Persekutuan Alumni Kristen Sumatera Utara (PAKSU)</span>
          <a
            href="https://paksu.info"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
          >
            paksu.info <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
