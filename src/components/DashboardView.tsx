'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Users, CheckCircle, Clock, XCircle, 
  Search, Download, RefreshCw, Send, ChevronDown, ChevronUp,
  Award, Lock, ExternalLink
} from 'lucide-react';

interface LeaderboardItem {
  id: number;
  name: string;
  group_name: string;
  phone?: string;
  total_assigned: number;
  sent_count: number;
  hadir_count: number;
  tidak_hadir_count: number;
  no_respon_count: number;
  gagal_count: number;
  belum_kirim_count: number;
  completion_percentage: number;
}

interface ActivityItem {
  id: number;
  status: string;
  notes: string;
  updated_at: string;
  recipient_name: string;
  committee_name: string;
  wave_number: number;
}

interface DashboardViewProps {
  signedInPanitia: any;
  onSelectPanitia: (panitia: any) => void;
  onOpenFlyer: () => void;
}

export default function DashboardView({
  signedInPanitia,
  onSelectPanitia,
  onOpenFlyer
}: DashboardViewProps) {
  const [selectedWave, setSelectedWave] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchPanitia, setSearchPanitia] = useState('');
  const [sortBy, setSortBy] = useState<'completion' | 'hadir' | 'assigned' | 'name'>('completion');
  const [expandedPanitiaId, setExpandedPanitiaId] = useState<number | null>(null);
  const [panitiaContacts, setPanitiaContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    fetchDashboard(selectedWave);
  }, [selectedWave]);

  const fetchDashboard = async (wave: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?wave=${wave}`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandPanitia = async (panitiaId: number) => {
    if (expandedPanitiaId === panitiaId) {
      setExpandedPanitiaId(null);
      setPanitiaContacts([]);
      return;
    }

    setExpandedPanitiaId(panitiaId);
    setLoadingContacts(true);
    try {
      const res = await fetch(`/api/panitia/${panitiaId}/contacts?wave=${selectedWave}`);
      const data = await res.json();
      if (data.success) {
        setPanitiaContacts(data.contacts);
      }
    } catch (err) {
      console.error('Error loading panitia contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleNudgePanitia = (p: LeaderboardItem) => {
    const text = `Shalom Kak ${p.name}, mohon info update pengiriman WA blast Natal PAKSU 2026 Tahap ${selectedWave} ya Kak. Saat ini progres: ${p.sent_count}/${p.total_assigned} jemaat (${p.completion_percentage}%). Semangat melayani! 🙏🎄`;
    const cleanPhone = p.phone ? p.phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone) {
      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const sortedLeaderboard = useMemo(() => {
    if (!dashboardData?.leaderboard) return [];
    let list = [...dashboardData.leaderboard];

    if (searchPanitia.trim()) {
      const q = searchPanitia.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.group_name.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'completion') {
        return b.completion_percentage - a.completion_percentage || b.hadir_count - a.hadir_count;
      }
      if (sortBy === 'hadir') {
        return b.hadir_count - a.hadir_count || b.completion_percentage - a.completion_percentage;
      }
      if (sortBy === 'assigned') {
        return b.total_assigned - a.total_assigned;
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [dashboardData?.leaderboard, searchPanitia, sortBy]);

  const waveStats = useMemo(() => {
    if (!dashboardData?.waves) return null;
    return dashboardData.waves.find((w: any) => w.id === selectedWave) || dashboardData.waves[0];
  }, [dashboardData, selectedWave]);

  const totalRecipients = dashboardData?.totalRecipients || 480;
  const sentCount = waveStats?.sent_count || 0;
  const overallPercent = totalRecipients > 0 ? Math.round((sentCount / totalRecipients) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Wave Selector */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Monitoring Progres Panitia
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau respon kehadiran jemaat dan progres pengiriman broadcast oleh 27 panitia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/export"
              download
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
            >
              <Download className="w-4 h-4" /> Export CSV (Excel)
            </a>
            <button
              onClick={() => fetchDashboard(selectedWave)}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition"
              title="Perbarui data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-800' : ''}`} />
            </button>
          </div>
        </div>

        {/* Wave Selection Pills */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Pilih Gelombang Broadcast:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {dashboardData?.waves?.map((w: any) => {
              const isActive = selectedWave === w.id;
              const wPercent = totalRecipients > 0 ? Math.round((w.sent_count / totalRecipients) * 100) : 0;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWave(w.id)}
                  className={`p-3.5 rounded-xl text-left border transition ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      Wave {w.wave_number} • {w.scheduled_date}
                    </span>
                    <span className="text-xs font-mono font-bold">{wPercent}%</span>
                  </div>
                  <div className="font-semibold text-sm mt-1 truncate">{w.title}</div>
                  <div className={`mt-2 text-xs flex items-center justify-between ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    <span>{w.sent_count} / {totalRecipients} Terkirim</span>
                    <span>Hadir: <strong className={isActive ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-bold'}>{w.hadir_count}</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Jemaat</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalRecipients}</div>
          <div className="text-[11px] text-slate-400 mt-1">27 Panitia Ditugaskan</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Pesan Terkirim</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{sentCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{overallPercent}% dari total jemaat</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs">
          <div className="text-xs text-emerald-800 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Konfirmasi Hadir
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{waveStats?.hadir_count || 0}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Akan hadir di UKI</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 shadow-xs">
          <div className="text-xs text-rose-800 font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Tidak Bisa Hadir
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{waveStats?.tidak_hadir_count || 0}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">Konfirmasi berhalangan</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-xs col-span-2 md:col-span-1">
          <div className="text-xs text-amber-800 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Menunggu Respon
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{waveStats?.no_respon_count || 0}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">Terkirim belum membalas</div>
        </div>
      </div>

      {/* Response Distribution Progress Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800">Distribusi Respon Broadcast Wave {selectedWave}</span>
          <span className="text-slate-500 font-normal">{sentCount} dari {totalRecipients} Terkirim ({overallPercent}%)</span>
        </div>

        {/* Stacked Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            title={`Hadir: ${waveStats?.hadir_count || 0}`}
            style={{ width: `${totalRecipients ? ((waveStats?.hadir_count || 0) / totalRecipients) * 100 : 0}%` }}
            className="h-full bg-emerald-500 transition-all"
          />
          <div
            title={`Tidak Hadir: ${waveStats?.tidak_hadir_count || 0}`}
            style={{ width: `${totalRecipients ? ((waveStats?.tidak_hadir_count || 0) / totalRecipients) * 100 : 0}%` }}
            className="h-full bg-rose-500 transition-all"
          />
          <div
            title={`Menunggu Respon: ${waveStats?.no_respon_count || 0}`}
            style={{ width: `${totalRecipients ? ((waveStats?.no_respon_count || 0) / totalRecipients) * 100 : 0}%` }}
            className="h-full bg-amber-400 transition-all"
          />
          <div
            title={`Gagal: ${waveStats?.gagal_count || 0}`}
            style={{ width: `${totalRecipients ? ((waveStats?.gagal_count || 0) / totalRecipients) * 100 : 0}%` }}
            className="h-full bg-red-600 transition-all"
          />
          <div
            title={`Belum Terkirim: ${waveStats?.belum_kirim_count || 0}`}
            style={{ width: `${totalRecipients ? ((waveStats?.belum_kirim_count || 0) / totalRecipients) * 100 : 0}%` }}
            className="h-full bg-slate-200 transition-all"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Hadir ({waveStats?.hadir_count || 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Tidak Hadir ({waveStats?.tidak_hadir_count || 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Menunggu Respon ({waveStats?.no_respon_count || 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Gagal ({waveStats?.gagal_count || 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Belum Kirim ({waveStats?.belum_kirim_count || 0})</span>
          </div>
        </div>
      </div>

      {/* Panitia Leaderboard & Progress Matrix */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Progres per Panitia ({sortedLeaderboard.length} Anggota)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian tugas masing-masing panitia. Hanya pemilik tugas yang dapat mengubah status jemaatnya.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400"
            >
              <option value="completion">% Selesai</option>
              <option value="hadir">Paling Banyak Hadir</option>
              <option value="assigned">Jumlah Kontak</option>
              <option value="name">Nama (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Search Panitia */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchPanitia}
            onChange={(e) => setSearchPanitia(e.target.value)}
            placeholder="Cari nama panitia atau grup divisi..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>

        {/* Leaderboard Cards */}
        <div className="space-y-2.5">
          {sortedLeaderboard.map((panitia, idx) => {
            const isExpanded = expandedPanitiaId === panitia.id;
            const isCurrentUser = signedInPanitia?.id === panitia.id;

            return (
              <div
                key={panitia.id}
                className={`rounded-xl border transition ${
                  isCurrentUser
                    ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                    : isExpanded
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleExpandPanitia(panitia.id)}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isCurrentUser ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{panitia.name}</span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Anda
                          </span>
                        )}
                        {panitia.completion_percentage >= 100 && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Selesai 🎉
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="text-slate-600">{panitia.group_name}</span>
                        <span>•</span>
                        <span>{panitia.sent_count} / {panitia.total_assigned} Jemaat</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Progress Bar */}
                  <div className="sm:w-44 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Progres:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {panitia.completion_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${panitia.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Badges & Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800" title="Hadir">
                        H: {panitia.hadir_count}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800" title="Tidak Hadir">
                        TH: {panitia.tidak_hadir_count}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800" title="Menunggu Respon">
                        NR: {panitia.no_respon_count}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => handleNudgePanitia(panitia)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-medium flex items-center gap-1"
                        title="Ingatkan Panitia via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden md:inline">Nudge</span>
                      </button>

                      <button
                        onClick={() => handleExpandPanitia(panitia.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        title="Rincian kontak"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded contacts */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>Daftar Jemaat ({panitiaContacts.length})</span>
                        {!isCurrentUser && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-normal lowercase">
                            <Lock className="w-3 h-3" /> hanya bisa diedit oleh {panitia.name}
                          </span>
                        )}
                      </div>
                      {isCurrentUser && (
                        <button
                          onClick={() => onSelectPanitia(panitia)}
                          className="text-[11px] text-blue-600 font-bold hover:underline"
                        >
                          Buka di Tab Kirim Pesan →
                        </button>
                      )}
                    </div>

                    {loadingContacts ? (
                      <div className="py-4 text-center text-xs text-slate-400">Memuat data jemaat...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {panitiaContacts.map((c) => (
                          <div
                            key={c.recipient_id}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="truncate">
                              <div className="font-semibold text-slate-900 truncate">{c.recipient_name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">+{c.phone_clean}</div>
                              {c.notes && (
                                <div className="text-[10px] text-slate-600 italic truncate mt-0.5">
                                  Catatan: {c.notes}
                                </div>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                                c.status === 'Konfirmasi Hadir'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : c.status === 'Konfirmasi Tidak Bisa Hadir'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : c.status === 'Terkirim Tidak Ada Respond'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
