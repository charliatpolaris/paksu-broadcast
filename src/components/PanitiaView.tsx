'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, Phone, Search, Copy, Check, MessageSquare, 
  ChevronDown, ChevronUp, RefreshCw, UserCheck, Sparkles, CheckCircle2
} from 'lucide-react';

interface PanitiaMember {
  id: number;
  name: string;
  group_name: string;
  phone?: string;
}

interface ContactItem {
  recipient_id: number;
  no_urut: string;
  recipient_name: string;
  phone_raw: string;
  phone_clean: string;
  status: string;
  notes: string;
  updated_at: string;
}

interface WaveInfo {
  id: number;
  wave_number: number;
  title: string;
  scheduled_date: string;
  default_message_template: string;
}

interface PanitiaViewProps {
  signedInPanitia: PanitiaMember | null;
  onOpenSignIn: () => void;
  onOpenFlyer: () => void;
}

export default function PanitiaView({
  signedInPanitia,
  onOpenSignIn,
  onOpenFlyer
}: PanitiaViewProps) {
  const [activeWave, setActiveWave] = useState<number>(1);
  const [waveInfo, setWaveInfo] = useState<WaveInfo | null>(null);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchContact, setSearchContact] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const [savingNotesId, setSavingNotesId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (signedInPanitia) {
      fetchContacts(signedInPanitia.id, activeWave);
    }
  }, [signedInPanitia, activeWave]);

  const fetchContacts = async (committeeId: number, wave: number, silent = false) => {
    if (!silent) {
      setLoadingContacts(true);
    }
    try {
      const res = await fetch(`/api/panitia/${committeeId}/contacts?wave=${wave}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
        setStats(data.stats);
        setWaveInfo(data.wave);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      if (!silent) {
        setLoadingContacts(false);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getPersonalizedMessage = (contactName: string) => {
    if (!waveInfo) return '';
    const panitiaName = signedInPanitia ? signedInPanitia.name : 'Panitia Natal PAKSU';
    return waveInfo.default_message_template
      .replace(/{nama}/g, contactName)
      .replace(/{panitia}/g, panitiaName);
  };

  const handleSendWhatsApp = (contact: ContactItem) => {
    if (!contact.phone_clean) {
      alert('Nomor HP tidak valid atau kosong.');
      return;
    }

    const message = getPersonalizedMessage(contact.recipient_name);
    const waUrl = `https://api.whatsapp.com/send?phone=${contact.phone_clean}&text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');

    if (contact.status === 'Belum Terkirim') {
      updateStatus(contact.recipient_id, 'Terkirim Tidak Ada Respond', contact.notes);
      showToast(`WhatsApp terbuka! Status ${contact.recipient_name} ditandai 'Terkirim'.`);
    } else {
      showToast(`Membuka WhatsApp untuk ${contact.recipient_name}`);
    }
  };

  const handleCopyMessage = (contact: ContactItem) => {
    const message = getPersonalizedMessage(contact.recipient_name);
    navigator.clipboard.writeText(message);
    setCopiedId(contact.recipient_id);
    showToast(`Pesan untuk ${contact.recipient_name} berhasil disalin!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const updateStatus = async (recipientId: number, newStatus: string, currentNotes: string) => {
    const targetContact = contacts.find(c => c.recipient_id === recipientId);
    const oldStatus = targetContact?.status || 'Belum Terkirim';
    if (oldStatus === newStatus) return;

    // 1. Instant optimistic update on contacts
    setContacts(prev => prev.map(c => {
      if (c.recipient_id === recipientId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));

    // 2. Instant optimistic update on progress counters
    setStats((prevStats: any) => {
      if (!prevStats) return prevStats;
      const newStats = { ...prevStats };
      const mapKey = (s: string) => {
        if (s === 'Konfirmasi Hadir') return 'hadir';
        if (s === 'Konfirmasi Tidak Bisa Hadir') return 'tidak_hadir';
        if (s === 'Terkirim Tidak Ada Respond') return 'no_respon';
        if (s === 'Tidak Terkirim') return 'gagal';
        return 'belum_kirim';
      };

      const oldKey = mapKey(oldStatus);
      const newKey = mapKey(newStatus);
      if (newStats[oldKey] !== undefined) newStats[oldKey] = Math.max(0, newStats[oldKey] - 1);
      if (newStats[newKey] !== undefined) newStats[newKey] = (newStats[newKey] || 0) + 1;
      return newStats;
    });

    try {
      const res = await fetch(`/api/contacts/${recipientId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waveId: activeWave,
          status: newStatus,
          notes: currentNotes,
          committeeId: signedInPanitia?.id
        })
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || 'Gagal memperbarui status');
        if (signedInPanitia) fetchContacts(signedInPanitia.id, activeWave, true);
      } else {
        // Silent sync in background without loading flicker
        if (signedInPanitia) fetchContacts(signedInPanitia.id, activeWave, true);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      if (signedInPanitia) fetchContacts(signedInPanitia.id, activeWave, true);
    }
  };

  const handleUpdateNotes = async (recipientId: number, currentStatus: string, newNotes: string) => {
    setSavingNotesId(recipientId);
    try {
      const res = await fetch(`/api/contacts/${recipientId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waveId: activeWave,
          status: currentStatus,
          notes: newNotes,
          committeeId: signedInPanitia?.id
        })
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || 'Gagal menyimpan catatan');
      } else {
        showToast('Keterangan berhasil disimpan');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSavingNotesId(null);
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (filterStatus === 'belum' && c.status !== 'Belum Terkirim') return false;
      if (filterStatus === 'hadir' && c.status !== 'Konfirmasi Hadir') return false;
      if (filterStatus === 'tidak_hadir' && c.status !== 'Konfirmasi Tidak Bisa Hadir') return false;
      if (filterStatus === 'no_respon' && c.status !== 'Terkirim Tidak Ada Respond') return false;
      if (filterStatus === 'gagal' && c.status !== 'Tidak Terkirim') return false;

      if (searchContact.trim()) {
        const query = searchContact.toLowerCase();
        const matchName = c.recipient_name.toLowerCase().includes(query);
        const matchPhone = (c.phone_clean || '').includes(query) || (c.phone_raw || '').includes(query);
        const matchNotes = (c.notes || '').toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchNotes) return false;
      }

      return true;
    });
  }, [contacts, filterStatus, searchContact]);

  // If not signed in, auto-open pop-up modal and show clean minimalist placeholder
  useEffect(() => {
    if (!signedInPanitia) {
      onOpenSignIn();
    }
  }, [signedInPanitia]);

  if (!signedInPanitia) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
          <img 
            src="/logo.png" 
            alt="Logo Yayasan PAKSU" 
            className="w-14 h-14 object-contain mx-auto drop-shadow-xs" 
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Sign In Diperlukan
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Ketik nama Anda sesuai SK Panitia untuk mengelola dan mengirimkan pesan ke jemaat tugas Anda.
            </p>
          </div>
          <div>
            <button
              onClick={onOpenSignIn}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Ketik Nama Panitia (Sign In)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completionPercent = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Halo, {signedInPanitia.name} 👋
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Divisi: <strong className="text-slate-700">{signedInPanitia.group_name}</strong> • Anda ditugaskan mengirimi pesan ke {stats?.total || 18} jemaat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFlyer}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
            >
              Info Acara
            </button>
            <button
              onClick={() => fetchContacts(signedInPanitia.id, activeWave)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition"
              title="Perbarui daftar jemaat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wave Selection Tabs */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pilih Gelombang Broadcast:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveWave(1)}
              className={`p-2.5 rounded-xl text-left border transition ${
                activeWave === 1
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`text-[10px] uppercase font-bold ${activeWave === 1 ? 'text-slate-300' : 'text-slate-400'}`}>
                Wave 1 • 22 Nov
              </div>
              <div className="font-semibold text-xs mt-0.5 truncate">Undangan Awal</div>
            </button>

            <button
              onClick={() => setActiveWave(2)}
              className={`p-2.5 rounded-xl text-left border transition ${
                activeWave === 2
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`text-[10px] uppercase font-bold ${activeWave === 2 ? 'text-slate-300' : 'text-slate-400'}`}>
                Wave 2 • 29 Nov
              </div>
              <div className="font-semibold text-xs mt-0.5 truncate">Reminder Konfirmasi</div>
            </button>

            <button
              onClick={() => setActiveWave(3)}
              className={`p-2.5 rounded-xl text-left border transition ${
                activeWave === 3
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`text-[10px] uppercase font-bold ${activeWave === 3 ? 'text-slate-300' : 'text-slate-400'}`}>
                Wave 3 • 6 Des
              </div>
              <div className="font-semibold text-xs mt-0.5 truncate">Final Countdown</div>
            </button>
          </div>
        </div>

        {/* Progress bar & Stat Chips */}
        {stats && (
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">
                Progres Pengiriman: <strong className="text-slate-900 font-mono">{stats.done} / {stats.total} Jemaat ({completionPercent}%)</strong>
              </span>
              <span className="text-slate-500 text-[11px]">
                Sisa: <strong className="text-slate-800">{stats.belum_kirim}</strong>
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-emerald-800 flex items-center justify-between">
                <span>Hadir</span>
                <strong className="text-sm font-bold">{stats.hadir}</strong>
              </div>
              <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-200/70 text-rose-800 flex items-center justify-between">
                <span>Tidak Hadir</span>
                <strong className="text-sm font-bold">{stats.tidak_hadir}</strong>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/70 text-amber-800 flex items-center justify-between">
                <span>Belum Respon</span>
                <strong className="text-sm font-bold">{stats.no_respon}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between">
                <span>Belum Kirim</span>
                <strong className="text-sm font-bold">{stats.belum_kirim}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchContact}
            onChange={(e) => setSearchContact(e.target.value)}
            placeholder="Cari nama jemaat atau nomor HP..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Semua ({contacts.length})
          </button>
          <button
            onClick={() => setFilterStatus('belum')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === 'belum'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Belum Terkirim ({stats?.belum_kirim || 0})
          </button>
          <button
            onClick={() => setFilterStatus('hadir')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === 'hadir'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            Hadir ({stats?.hadir || 0})
          </button>
          <button
            onClick={() => setFilterStatus('tidak_hadir')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === 'tidak_hadir'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            Tidak Hadir ({stats?.tidak_hadir || 0})
          </button>
          <button
            onClick={() => setFilterStatus('no_respon')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === 'no_respon'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            Menunggu Respon ({stats?.no_respon || 0})
          </button>
        </div>
      </div>

      {/* Contact Cards List */}
      {loadingContacts ? (
        <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-slate-600" /> Memuat data jemaat Anda...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12 p-8 rounded-2xl bg-white border border-slate-200">
          <h4 className="text-slate-800 font-semibold text-sm">Tidak ada kontak dengan filter ini</h4>
          <p className="text-slate-400 text-xs mt-1">Ubah kata kunci pencarian atau filter status di atas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact, idx) => {
            const isCopied = copiedId === contact.recipient_id;
            const isExpanded = expandedMessageId === contact.recipient_id;
            const isSavingNotes = savingNotesId === contact.recipient_id;

            return (
              <div
                key={contact.recipient_id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-200 ease-out"
              >
                {/* Header: Name, No Urut, Phone & Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-700 shrink-0">
                      {contact.no_urut || idx + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                        {contact.recipient_name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700 font-medium">
                          {contact.phone_clean ? `+${contact.phone_clean}` : '(Nomor kosong)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown - Full width on mobile for thumb friendliness */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={contact.status}
                      onChange={(e) => updateStatus(contact.recipient_id, e.target.value, contact.notes)}
                      className={`w-full sm:w-auto text-xs font-semibold rounded-xl px-3 py-2 sm:py-1.5 border focus:outline-none transition cursor-pointer shadow-2xs ${
                        contact.status === 'Konfirmasi Hadir'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : contact.status === 'Konfirmasi Tidak Bisa Hadir'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : contact.status === 'Terkirim Tidak Ada Respond'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : contact.status === 'Tidak Terkirim'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="Belum Terkirim">⚪ Belum Terkirim</option>
                      <option value="Terkirim Tidak Ada Respond">🟡 Terkirim Tidak Ada Respond</option>
                      <option value="Konfirmasi Hadir">🟢 Konfirmasi Hadir</option>
                      <option value="Konfirmasi Tidak Bisa Hadir">🔴 Konfirmasi Tidak Bisa Hadir</option>
                      <option value="Tidak Terkirim">⛔ Tidak Terkirim (Gagal)</option>
                    </select>
                  </div>
                </div>

                {/* Primary Action Buttons: WhatsApp & Copy */}
                <div className="py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={() => handleSendWhatsApp(contact)}
                    disabled={!contact.phone_clean}
                    className="w-full sm:flex-initial flex items-center justify-center gap-2 py-3 sm:py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm shadow-sm transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Pesan WhatsApp</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleCopyMessage(contact)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 sm:py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{isCopied ? 'Tersalin' : 'Salin Pesan'}</span>
                    </button>

                    <button
                      onClick={() => setExpandedMessageId(isExpanded ? null : contact.recipient_id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 py-2.5 sm:py-2 px-3 rounded-xl text-slate-600 hover:text-slate-800 bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200 text-xs font-medium transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isExpanded ? 'Tutup' : 'Lihat Teks'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Message preview accordion */}
                {isExpanded && (
                  <div className="my-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line font-sans">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Teks WhatsApp Otomatis:
                    </div>
                    {getPersonalizedMessage(contact.recipient_name)}
                  </div>
                )}

                {/* Notes (Keterangan) */}
                <div className="mt-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Catatan / Keterangan Respon:</span>
                    {isSavingNotes && <span className="text-blue-600">Menyimpan...</span>}
                  </div>
                  <input
                    type="text"
                    defaultValue={contact.notes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (contact.notes || '')) {
                        handleUpdateNotes(contact.recipient_id, contact.status, e.target.value);
                      }
                    }}
                    placeholder="Tulis keterangan... (misal: 'Hadir bawa anak', 'Sedang dinas luar kota')"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-base sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
