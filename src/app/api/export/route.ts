import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        r.no_urut,
        r.name as nama,
        r.phone_clean as nomor_hp,
        c.name as panitia_pic,
        c.group_name as divisi_panitia,
        COALESCE(l1.status, 'Belum Terkirim') as status_wave1,
        COALESCE(l1.notes, '') as catatan_wave1,
        COALESCE(l2.status, 'Belum Terkirim') as status_wave2,
        COALESCE(l2.notes, '') as catatan_wave2,
        COALESCE(l3.status, 'Belum Terkirim') as status_wave3,
        COALESCE(l3.notes, '') as catatan_wave3
      FROM recipients r
      LEFT JOIN committee_members c ON c.id = r.assigned_committee_id
      LEFT JOIN broadcast_logs l1 ON l1.recipient_id = r.id AND l1.wave_id = 1
      LEFT JOIN broadcast_logs l2 ON l2.recipient_id = r.id AND l2.wave_id = 2
      LEFT JOIN broadcast_logs l3 ON l3.recipient_id = r.id AND l3.wave_id = 3
      ORDER BY r.id ASC
    `);

    // Build CSV
    const headers = [
      'No',
      'Nama Jemaat/Alumni',
      'No WhatsApp',
      'Panitia PIC',
      'Divisi Panitia',
      'Status Blast 1 (22 Nov)',
      'Catatan Blast 1',
      'Status Blast 2 (29 Nov)',
      'Catatan Blast 2',
      'Status Blast 3 (6 Des)',
      'Catatan Blast 3'
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = res.rows.map(row => [
      escapeCsv(row.no_urut),
      escapeCsv(row.nama),
      escapeCsv(row.nomor_hp ? `'${row.nomor_hp}` : ''),
      escapeCsv(row.panitia_pic),
      escapeCsv(row.divisi_panitia),
      escapeCsv(row.status_wave1),
      escapeCsv(row.catatan_wave1),
      escapeCsv(row.status_wave2),
      escapeCsv(row.catatan_wave2),
      escapeCsv(row.status_wave3),
      escapeCsv(row.catatan_wave3)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Monitoring_WA_Blast_Natal_PAKSU_2026.csv"'
      }
    });
  } catch (error: any) {
    console.error('Error generating export:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
