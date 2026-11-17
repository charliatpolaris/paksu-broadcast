import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.group_name,
        c.phone,
        COUNT(r.id)::int as total_assigned,
        COUNT(CASE WHEN l1.status != 'Belum Terkirim' AND l1.status IS NOT NULL THEN 1 END)::int as wave1_done,
        COUNT(CASE WHEN l1.status = 'Konfirmasi Hadir' THEN 1 END)::int as wave1_hadir,
        COUNT(CASE WHEN l2.status != 'Belum Terkirim' AND l2.status IS NOT NULL THEN 1 END)::int as wave2_done,
        COUNT(CASE WHEN l2.status = 'Konfirmasi Hadir' THEN 1 END)::int as wave2_hadir,
        COUNT(CASE WHEN l3.status != 'Belum Terkirim' AND l3.status IS NOT NULL THEN 1 END)::int as wave3_done,
        COUNT(CASE WHEN l3.status = 'Konfirmasi Hadir' THEN 1 END)::int as wave3_hadir
      FROM committee_members c
      LEFT JOIN recipients r ON r.assigned_committee_id = c.id
      LEFT JOIN broadcast_logs l1 ON l1.recipient_id = r.id AND l1.wave_id = 1
      LEFT JOIN broadcast_logs l2 ON l2.recipient_id = r.id AND l2.wave_id = 2
      LEFT JOIN broadcast_logs l3 ON l3.recipient_id = r.id AND l3.wave_id = 3
      GROUP BY c.id, c.name, c.group_name, c.phone
      ORDER BY c.id ASC
    `);

    return NextResponse.json({ success: true, panitia: result.rows });
  } catch (error: any) {
    console.error('Error fetching panitia:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
