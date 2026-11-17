'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Shuffle, Download, 
  ChevronLeft, ChevronRight, Phone, Check, RefreshCw, X, Lock
} from 'lucide-react';

interface RecipientItem {
  id: number;
  no_urut: string;
  name: string;
  phone_raw: string;
  phone_clean: string;
  assigned_committee_id: number;
  committee_name: string;
  committee_group: string;
  status: string;
  notes: string;
  updated_at: string;
}

interface RecipientsViewProps {
  signedInPanitia: any;
  onOpenSignIn: () => void;
}

export default function RecipientsView({ signedInPanitia, onOpenSignIn }: RecipientsViewProps) {
  const [contacts, setContacts] = useState<RecipientItem[]>([]);
  const [panitiaList, setPanitiaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPanitia, setSelectedPanitia] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWave, setSelectedWave] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', committeeId: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [autoBalancing, setAutoBalancing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPanitiaList();
  }, []);

  // Debounce search input by 280ms to prevent stuttering & API spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchContacts();
  }, [page, debouncedSearch, selectedPanitia, selectedStatus, selectedWave]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPanitiaList = async () => {
    try {
      const res = await fetch('/api/panitia');
      const data = await res.json();
      if (data.success) {
        setPanitiaList(data.panitia);
      }
    } catch (err) {
      console.error('Error fetching panitia:', err);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
        search: debouncedSearch,
        panitiaId: selectedPanitia,
        status: selectedStatus,
        wave: selectedWave.toString()
      });
      const res = await fetch(`/api/contacts?${params}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (contact: RecipientItem, newStatus: string) => {
    if (!signedInPanitia) {
      showToast('Silakan sign in panitia terlebih dahulu.');
      onOpenSignIn();
      return;
    }

    if (contact.assigned_committee_id && contact.assigned_committee_id !== signedInPanitia.id) {
      showToast(`Akses Ditolak: Jemaat ini ditugaskan ke ${contact.committee_name}.`);
      return;
    }

    try {
      const res = await fetch(`/api/contacts/${contact.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waveId: selectedWave,
          status: newStatus,
          notes: contact.notes,
          committeeId: signedInPanitia.id
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status berhasil diperbarui');
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: newStatus } : c));
      } else {
        showToast(data.error || 'Gagal memperbarui status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleReassign = async (recipientId: number, newCommitteeId: string) => {
    try {
      const res = await fetch(`/api/contacts/${recipientId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ committeeId: newCommitteeId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Panitia PIC berhasil dialihkan');
        fetchContacts();
      }
    } catch (err) {
      console.error('Error reassigning contact:', err);
    }
  };

  const handleAutoBalance = async () => {
    if (!confirm('Apakah Anda yakin ingin membagi rata 480 jemaat kepada 27 anggota panitia SK secara adil?')) {
      return;
    }

    setAutoBalancing(true);
    try {
      const res = await fetch('/api/contacts/auto-balance', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchContacts();
      }
    } catch (err) {
      console.error('Error auto balancing:', err);
    } finally {
      setAutoBalancing(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newContact.name,
          phone: newContact.phone,
          assignedCommitteeId: newContact.committeeId ? parseInt(newContact.committeeId, 10) : null,
          notes: newContact.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Jemaat ${newContact.name} berhasil ditambahkan!`);
        setShowAddModal(false);
        setNewContact({ name: '', phone: '', committeeId: '', notes: '' });
        fetchContacts();
      }
    } catch (err) {
      console.error('Error adding contact:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Daftar Master Jemaat ({totalCount} Kontak)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Data lengkap penerima broadcast dan panitia penanggung jawab sesuai SK.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Tambah Jemaat
            </button>
            <button
              onClick={handleAutoBalance}
              disabled={autoBalancing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 transition"
              title="Bagi rata penerima ke 27 panitia"
            >
              <Shuffle className={`w-4 h-4 ${autoBalancing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Ratakan Pembagian</span>
            </button>
            <a
              href="/api/export"
              download
              className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Tahap Broadcast:</label>
            <select
              value={selectedWave}
              onChange={(e) => {
                setSelectedWave(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="1">Wave 1 (22 Nov - Undangan Awal)</option>
              <option value="2">Wave 2 (29 Nov - Reminder)</option>
              <option value="3">Wave 3 (6 Des - Final Countdown)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Panitia PIC:</label>
            <select
              value={selectedPanitia}
              onChange={(e) => {
                setSelectedPanitia(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="all">Semua Panitia ({panitiaList.length})</option>
              {panitiaList.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Status Kehadiran:</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="all">Semua Status</option>
              <option value="Konfirmasi Hadir">🟢 Konfirmasi Hadir</option>
              <option value="Konfirmasi Tidak Bisa Hadir">🔴 Konfirmasi Tidak Bisa Hadir</option>
              <option value="Terkirim Tidak Ada Respond">🟡 Terkirim Tidak Ada Respond</option>
              <option value="Belum Terkirim">⚪ Belum Terkirim</option>
              <option value="Tidak Terkirim">⛔ Tidak Terkirim (Gagal)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Cari Jemaat:</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Nama atau no HP..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base sm:text-xs text-slate-800 focus:outline-none focus:border-slate-400 placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table & Mobile Cards Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Mobile Cards (Phones - Block on Mobile, Hidden on Tablet/Desktop) */}
        <div className={`md:hidden divide-y divide-slate-100 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          {loading && contacts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-600" />
              Memuat data jemaat...
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tidak ada jemaat yang cocok.
            </div>
          ) : (
            contacts.map((contact, idx) => {
              return (
                <div key={contact.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        #{contact.no_urut || ((page - 1) * 30 + idx + 1)}
                      </span>
                      <div className="font-bold text-slate-900 text-sm leading-tight">
                        {contact.name}
                      </div>
                    </div>

                    {contact.phone_clean ? (
                      <a
                        href={`https://wa.me/${contact.phone_clean}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-medium flex items-center gap-1 shrink-0"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>+{contact.phone_clean}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No HP kosong</span>
                    )}
                  </div>

                  {/* PIC & Status in 2 columns on mobile */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">PIC Panitia</span>
                      <select
                        value={contact.assigned_committee_id || ''}
                        onChange={(e) => handleReassign(contact.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="">Belum Ditugaskan</option>
                        {panitiaList.map((p) => (
                          <option key={p.id} value={p.id.toString()}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Status Wave {selectedWave}</span>
                      <select
                        value={contact.status}
                        onChange={(e) => handleUpdateStatus(contact, e.target.value)}
                        className={`w-full text-xs font-semibold rounded-lg px-2 py-1.5 border focus:outline-none ${
                          contact.status === 'Konfirmasi Hadir'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : contact.status === 'Konfirmasi Tidak Bisa Hadir'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : contact.status === 'Terkirim Tidak Ada Respond'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Belum Terkirim">⚪ Belum</option>
                        <option value="Terkirim Tidak Ada Respond">🟡 Terkirim</option>
                        <option value="Konfirmasi Hadir">🟢 Hadir</option>
                        <option value="Konfirmasi Tidak Bisa Hadir">🔴 Tdk Hadir</option>
                        <option value="Tidak Terkirim">⛔ Gagal</option>
                      </select>
                    </div>
                  </div>

                  {contact.notes && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                      Catatan: {contact.notes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Jemaat</th>
                <th className="px-4 py-3">No WhatsApp</th>
                <th className="px-4 py-3">Panitia PIC (SK)</th>
                <th className="px-4 py-3">Status Wave {selectedWave}</th>
                <th className="px-4 py-3">Catatan Respon</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 text-slate-700 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
              {loading && contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-600" />
                    Memuat data...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Tidak ada jemaat yang cocok.
                  </td>
                </tr>
              ) : (
                contacts.map((contact, idx) => {
                  const isOwner = signedInPanitia && signedInPanitia.id === contact.assigned_committee_id;

                  return (
                    <tr key={contact.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {contact.no_urut || ((page - 1) * 30 + idx + 1)}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {contact.name}
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {contact.phone_clean ? (
                          <a
                            href={`https://wa.me/${contact.phone_clean}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline hover:text-emerald-600"
                          >
                            +{contact.phone_clean}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Panitia Assignment */}
                      <td className="px-4 py-3">
                        <select
                          value={contact.assigned_committee_id || ''}
                          onChange={(e) => handleReassign(contact.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer max-w-[160px] truncate"
                        >
                          <option value="">Belum Ditugaskan</option>
                          {panitiaList.map((p) => (
                            <option key={p.id} value={p.id.toString()}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3">
                        <select
                          value={contact.status}
                          onChange={(e) => handleUpdateStatus(contact, e.target.value)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                            contact.status === 'Konfirmasi Hadir'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : contact.status === 'Konfirmasi Tidak Bisa Hadir'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : contact.status === 'Terkirim Tidak Ada Respond'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Belum Terkirim">⚪ Belum Terkirim</option>
                          <option value="Terkirim Tidak Ada Respond">🟡 Terkirim Tidak Ada Respond</option>
                          <option value="Konfirmasi Hadir">🟢 Konfirmasi Hadir</option>
                          <option value="Konfirmasi Tidak Bisa Hadir">🔴 Konfirmasi Tidak Bisa Hadir</option>
                          <option value="Tidak Terkirim">⛔ Tidak Terkirim (Gagal)</option>
                        </select>
                      </td>

                      {/* Notes Field */}
                      <td className="px-4 py-3">
                        <span className="text-slate-600 text-xs">
                          {contact.notes || <span className="text-slate-300 italic">-</span>}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Halaman <strong className="text-slate-900">{page}</strong> dari <strong className="text-slate-900">{totalPages || 1}</strong> ({totalCount} jemaat)
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add Contact */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Tambah Jemaat Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Jemaat *</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contoh: Bpk. John Doe"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tugaskan ke Panitia PIC</label>
                <select
                  value={newContact.committeeId}
                  onChange={(e) => setNewContact({ ...newContact, committeeId: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  <option value="">Pilih Panitia...</option>
                  {panitiaList.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
