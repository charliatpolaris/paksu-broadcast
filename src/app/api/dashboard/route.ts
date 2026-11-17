import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waveId = parseInt(searchParams.get('wave') || '1', 10);

    // Total recipients count
    const totalRecRes = await query('SELECT COUNT(*)::int as count FROM recipients');
    const totalRecipients = totalRecRes.rows[0]?.count || 0;

    // Total panitia count
    const totalPanitiaRes = await query('SELECT COUNT(*)::int as count FROM committee_members');
    const totalPanitia = totalPanitiaRes.rows[0]?.count || 0;

    // Waves overview
    const wavesRes = await query(`
      SELECT 
        w.id,
        w.wave_number,
        w.title,
        w.scheduled_date,
        COUNT(l.id)::int as total_logs,
        COUNT(CASE WHEN l.status != 'Belum Terkirim' AND l.status IS NOT NULL THEN 1 END)::int as sent_count,
        COUNT(CASE WHEN l.status = 'Konfirmasi Hadir' THEN 1 END)::int as hadir_count,
        COUNT(CASE WHEN l.status = 'Konfirmasi Tidak Bisa Hadir' THEN 1 END)::int as tidak_hadir_count,
        COUNT(CASE WHEN l.status = 'Terkirim Tidak Ada Respond' THEN 1 END)::int as no_respon_count,
        COUNT(CASE WHEN l.status = 'Tidak Terkirim' THEN 1 END)::int as gagal_count,
        COUNT(CASE WHEN l.status = 'Belum Terkirim' OR l.status IS NULL THEN 1 END)::int as belum_kirim_count
      FROM broadcast_waves w
      LEFT JOIN broadcast_logs l ON l.wave_id = w.id
      GROUP BY w.id, w.wave_number, w.title, w.scheduled_date
      ORDER BY w.wave_number ASC
    `);

    // Status breakdown for selected wave
    const breakdownRes = await query(`
      SELECT 
        COALESCE(l.status, 'Belum Terkirim') as status,
        COUNT(*)::int as count
      FROM recipients r
      LEFT JOIN broadcast_logs l ON l.recipient_id = r.id AND l.wave_id = $1
      GROUP BY COALESCE(l.status, 'Belum Terkirim')
    `, [waveId]);

    // Leaderboard Panitia for selected wave
    const leaderboardRes = await query(`
      SELECT 
        c.id,
        c.name,
        c.group_name,
        c.phone,
        COUNT(r.id)::int as total_assigned,
        COUNT(CASE WHEN l.status != 'Belum Terkirim' AND l.status IS NOT NULL THEN 1 END)::int as sent_count,
        COUNT(CASE WHEN l.status = 'Konfirmasi Hadir' THEN 1 END)::int as hadir_count,
        COUNT(CASE WHEN l.status = 'Konfirmasi Tidak Bisa Hadir' THEN 1 END)::int as tidak_hadir_count,
        COUNT(CASE WHEN l.status = 'Terkirim Tidak Ada Respond' THEN 1 END)::int as no_respon_count,
        COUNT(CASE WHEN l.status = 'Tidak Terkirim' THEN 1 END)::int as gagal_count,
        COUNT(CASE WHEN l.status = 'Belum Terkirim' OR l.status IS NULL THEN 1 END)::int as belum_kirim_count,
        ROUND((COUNT(CASE WHEN l.status != 'Belum Terkirim' AND l.status IS NOT NULL THEN 1 END)::numeric / NULLIF(COUNT(r.id), 0) * 100), 1) as completion_percentage
      FROM committee_members c
      LEFT JOIN recipients r ON r.assigned_committee_id = c.id
      LEFT JOIN broadcast_logs l ON l.recipient_id = r.id AND l.wave_id = $1
      GROUP BY c.id, c.name, c.group_name, c.phone
      ORDER BY sent_count DESC, hadir_count DESC, c.name ASC
    `, [waveId]);

    // Recent activity log updates
    const recentActivityRes = await query(`
      SELECT 
        l.id,
        l.status,
        l.notes,
        l.updated_at,
        r.name as recipient_name,
        c.name as committee_name,
        w.wave_number
      FROM broadcast_logs l
      JOIN recipients r ON r.id = l.recipient_id
      LEFT JOIN committee_members c ON c.id = l.committee_id
      JOIN broadcast_waves w ON w.id = l.wave_id
      WHERE l.status != 'Belum Terkirim'
      ORDER BY l.updated_at DESC
      LIMIT 10
    `);

    // Event settings
    const settingsRes = await query('SELECT key, value FROM event_settings');
    const settings: Record<string, string> = {};
    settingsRes.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({
      success: true,
      totalRecipients,
      totalPanitia,
      selectedWaveId: waveId,
      waves: wavesRes.rows,
      breakdown: breakdownRes.rows,
      leaderboard: leaderboardRes.rows,
      recentActivity: recentActivityRes.rows,
      settings
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
