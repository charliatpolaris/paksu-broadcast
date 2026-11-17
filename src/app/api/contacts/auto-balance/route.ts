import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Get all panitia members ordered by id
    const panitiaRes = await query('SELECT id FROM committee_members ORDER BY id ASC');
    const panitiaList = panitiaRes.rows;

    if (panitiaList.length === 0) {
      return NextResponse.json({ success: false, error: 'No committee members found' }, { status: 400 });
    }

    // Get all recipients ordered by id
    const recRes = await query('SELECT id FROM recipients ORDER BY id ASC');
    const recipients = recRes.rows;

    const numPanitia = panitiaList.length;

    // Distribute evenly
    for (let i = 0; i < recipients.length; i++) {
      const recId = recipients[i].id;
      const panitiaId = panitiaList[i % numPanitia].id;

      await query('UPDATE recipients SET assigned_committee_id = $1 WHERE id = $2', [panitiaId, recId]);
      await query('UPDATE broadcast_logs SET committee_id = $1 WHERE recipient_id = $2', [panitiaId, recId]);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully distributed ${recipients.length} recipients across ${numPanitia} committee members.`
    });
  } catch (error: any) {
    console.error('Error auto-balancing contacts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
