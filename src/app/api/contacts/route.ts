import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const panitiaId = searchParams.get('panitiaId');
    const status = searchParams.get('status');
    const waveId = parseInt(searchParams.get('wave') || '1', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let conditions = ['1=1'];
    let params: any[] = [waveId];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(r.name) LIKE $${params.length} OR r.phone_clean LIKE $${params.length} OR r.phone_raw LIKE $${params.length})`);
    }

    if (panitiaId && panitiaId !== 'all') {
      params.push(parseInt(panitiaId, 10));
      conditions.push(`r.assigned_committee_id = $${params.length}`);
    }

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`COALESCE(l.status, 'Belum Terkirim') = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    // Count query
    const countSql = `
      SELECT COUNT(r.id)::int as total
      FROM recipients r
      LEFT JOIN broadcast_logs l ON l.recipient_id = r.id AND l.wave_id = $1
      WHERE ${whereClause}
    `;
    const countRes = await query(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    // Data query
    const dataSql = `
      SELECT 
        r.id,
        r.no_urut,
        r.name,
        r.phone_raw,
        r.phone_clean,
        r.assigned_committee_id,
        c.name as committee_name,
        c.group_name as committee_group,
        COALESCE(l.status, 'Belum Terkirim') as status,
        COALESCE(l.notes, '') as notes,
        l.sent_at,
        l.updated_at
      FROM recipients r
      LEFT JOIN committee_members c ON c.id = r.assigned_committee_id
      LEFT JOIN broadcast_logs l ON l.recipient_id = r.id AND l.wave_id = $1
      WHERE ${whereClause}
      ORDER BY r.id ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const dataRes = await query(dataSql, params);

    return NextResponse.json({
      success: true,
      contacts: dataRes.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, assignedCommitteeId, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    let phoneClean = (phone || '').replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('0')) {
      phoneClean = '62' + phoneClean.slice(1);
    } else if (phoneClean.startsWith('8')) {
      phoneClean = '62' + phoneClean;
    }

    // Insert recipient
    const res = await query(`
      INSERT INTO recipients (name, phone_raw, phone_clean, assigned_committee_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name.trim(), phone || '', phoneClean, assignedCommitteeId || null]);

    const recipient = res.rows[0];

    // Seed broadcast logs for wave 1, 2, 3
    for (let w = 1; w <= 3; w++) {
      await query(`
        INSERT INTO broadcast_logs (recipient_id, wave_id, committee_id, status, notes)
        VALUES ($1, $2, $3, 'Belum Terkirim', $4)
      `, [recipient.id, w, assignedCommitteeId || null, notes || '']);
    }

    return NextResponse.json({ success: true, recipient });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
