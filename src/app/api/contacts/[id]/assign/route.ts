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
      return NextResponse.json({ success: false, error: 'Invalid recipient ID' }, { status: 400 });
    }

    const body = await request.json();
    const { committeeId } = body;

    const commId = committeeId ? parseInt(committeeId, 10) : null;

    // Update recipient
    await query(`
      UPDATE recipients
      SET assigned_committee_id = $1
      WHERE id = $2
    `, [commId, recipientId]);

    // Update committee_id in broadcast_logs
    await query(`
      UPDATE broadcast_logs
      SET committee_id = $1
      WHERE recipient_id = $2
    `, [commId, recipientId]);

    return NextResponse.json({ success: true, message: 'Assigned committee updated successfully' });
  } catch (error: any) {
    console.error('Error reassigning contact:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
