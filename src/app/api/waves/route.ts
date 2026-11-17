import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query('SELECT * FROM broadcast_waves ORDER BY wave_number ASC');
    return NextResponse.json({ success: true, waves: res.rows });
  } catch (error: any) {
    console.error('Error fetching waves:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
