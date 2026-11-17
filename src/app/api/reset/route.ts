import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wave = searchParams.get('wave') || 'all';

    if (wave === 'all') {
      await query(`
        UPDATE broadcast_logs
        SET status = 'Belum Terkirim', notes = '', sent_at = NULL, updated_at = CURRENT_TIMESTAMP
      `);
      return NextResponse.json({
        success: true,
        message: 'Semua data kehadiran dan status broadcast (Wave 1, 2, 3) telah berhasil direset ke status awal (Belum Terkirim).'
      });
    } else {
      const waveId = parseInt(wave, 10);
      await query(`
        UPDATE broadcast_logs
        SET status = 'Belum Terkirim', notes = '', sent_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE wave_id = $1
      `, [waveId]);
      return NextResponse.json({
        success: true,
        message: `Data kehadiran dan status broadcast Wave ${waveId} telah berhasil direset.`
      });
    }
  } catch (error: any) {
    console.error('Error resetting attendance data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
