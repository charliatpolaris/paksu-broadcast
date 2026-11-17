import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const committeeId = parseInt(params.id, 10);
    if (isNaN(committeeId)) {
      return NextResponse.json({ success: false, error: 'Invalid committee ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const waveId = parseInt(searchParams.get('wave') || '1', 10);

    // Get panitia info
    const panitiaRes = await query('SELECT * FROM committee_members WHERE id = $1', [committeeId]);
    if (panitiaRes.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Panitia not found' }, { status: 404 });
    }
    const panitia = panitiaRes.rows[0];

    // Get wave info & template
    const waveRes = await query('SELECT * FROM broadcast_waves WHERE id = $1', [waveId]);
    const wave = waveRes.rows[0] || null;

    // Get assigned contacts with log for this wave
    const contactsRes = await query(`
      SELECT 
        r.id as recipient_id,
        r.no_urut,
        r.name as recipient_name,
        r.phone_raw,
        r.phone_clean,
        r.assigned_committee_id,
        COALESCE(l.id, 0) as log_id,
        COALESCE(l.status, 'Belum Terkirim') as status,
        COALESCE(l.notes, '') as notes,
        l.sent_at,
        l.updated_at
      FROM recipients r
      LEFT JOIN broadcast_logs l ON l.recipient_id = r.id AND l.wave_id = $2
      WHERE r.assigned_committee_id = $1
      ORDER BY r.id ASC
    `, [committeeId, waveId]);

    // Also get quick stats for this panitia for this wave
    const statsRes = await query(`
      SELECT 
        COUNT(r.id)::int as total,
        COUNT(CASE WHEN l.status != 'Belum Terkirim' AND l.status IS NOT NULL THEN 1 END)::int as done,
        COUNT(CASE WHEN l.status = 'Konfirmasi Hadir' THEN 1 END)::int as hadir,
        COUNT(CASE WHEN l.status = 'Konfirmasi Tidak Bisa Hadir' THEN 1 END)::int as tidak_hadir,
        COUNT(CASE WHEN l.status = 'Terkirim Tidak Ada Respond' THEN 1 END)::int as no_respon,
        COUNT(CASE WHEN l.status = 'Tidak Terkirim' THEN 1 END)::int as gagal,
        COUNT(CASE WHEN l.status = 'Belum Terkirim' OR l.status IS NULL THEN 1 END)::int as belum_kirim
      FROM recipients r
      LEFT JOIN broadcast_logs l ON l.recipient_id = r.id AND l.wave_id = $2
      WHERE r.assigned_committee_id = $1
    `, [committeeId, waveId]);

    return NextResponse.json({
      success: true,
      panitia,
      wave,
      stats: statsRes.rows[0],
      contacts: contactsRes.rows
    });
  } catch (error: any) {
    console.error('Error fetching panitia contacts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
