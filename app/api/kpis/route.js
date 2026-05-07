import { NextResponse } from 'next/server';
import { logEntry } from '@/lib/kpi-store';

export const dynamic = 'force-dynamic';

// POST /api/kpis/[id]/log — agregar entrada de avance
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const entry = await request.json();
    // entry = { date, value, note }
    const updated = await logEntry(id, entry);
    if (!updated) {
      return NextResponse.json({ error: 'KPI no encontrado' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    console.error('POST /api/kpis/[id]/log error:', e);
    return NextResponse.json({ error: 'Error al registrar avance' }, { status: 500 });
  }
}
