import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = parseInt(params.id, 10);
    if (isNaN(recipientId)) {
      return NextResponse.json({ success: false, error: 'ID Jemaat tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const { waveId = 1, status, notes, committeeId, isAdmin } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status wajib diisi' }, { status: 400 });
    }

    // Verify recipient ownership
    const recipientRes = await query('SELECT id, name, assigned_committee_id FROM recipients WHERE id = $1', [recipientId]);
    if (recipientRes.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Jemaat tidak ditemukan' }, { status: 404 });
    }

    const recipient = recipientRes.rows[0];

    // Authorization check: User A cannot update User B's contacts
    if (!isAdmin) {
      if (!committeeId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Akses Ditolak: Silakan sign in terlebih dahulu dengan nama panitia Anda.' 
        }, { status: 401 });
      }

      if (recipient.assigned_committee_id && recipient.assigned_committee_id !== parseInt(committeeId, 10)) {
        return NextResponse.json({ 
          success: false, 
          error: `Akses Ditolak: Jemaat ini ditugaskan kepada panitia lain. Anda hanya dapat memperbarui jemaat Anda sendiri.` 
        }, { status: 403 });
      }
    }

    // Upsert into broadcast_logs
    const now = new Date();
    const isSent = status !== 'Belum Terkirim';
    const sentAt = isSent ? now : null;

    const result = await query(`
      INSERT INTO broadcast_logs (recipient_id, wave_id, committee_id, status, notes, sent_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (recipient_id, wave_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        committee_id = COALESCE(EXCLUDED.committee_id, broadcast_logs.committee_id),
        sent_at = CASE 
          WHEN EXCLUDED.status != 'Belum Terkirim' AND broadcast_logs.sent_at IS NULL THEN EXCLUDED.sent_at 
          ELSE broadcast_logs.sent_at 
        END,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `, [recipientId, waveId, committeeId || recipient.assigned_committee_id, status, notes || '', sentAt, now]);

    return NextResponse.json({ success: true, log: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating contact status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
