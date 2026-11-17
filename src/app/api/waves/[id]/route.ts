import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const waveId = parseInt(params.id, 10);
    if (isNaN(waveId)) {
      return NextResponse.json({ success: false, error: 'Invalid wave ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, scheduled_date, default_message_template } = body;

    const res = await query(`
      UPDATE broadcast_waves
      SET 
        title = COALESCE($1, title),
        scheduled_date = COALESCE($2, scheduled_date),
        default_message_template = COALESCE($3, default_message_template)
      WHERE id = $4
      RETURNING *
    `, [title, scheduled_date, default_message_template, waveId]);

    return NextResponse.json({ success: true, wave: res.rows[0] });
  } catch (error: any) {
    console.error('Error updating wave:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
