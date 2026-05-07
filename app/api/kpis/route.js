import { NextResponse } from 'next/server';
import { getAllKpis, addKpi } from '@/lib/kpi-store';

export const dynamic = 'force-dynamic';

// GET /api/kpis — listar todos los KPIs
export async function GET() {
  try {
    const kpis = await getAllKpis();
    return NextResponse.json(kpis);
  } catch (e) {
    console.error('GET /api/kpis error:', e);
    return NextResponse.json({ error: 'Error al cargar KPIs' }, { status: 500 });
  }
}

// POST /api/kpis — crear KPI nuevo
export async function POST(request) {
  try {
    const body = await request.json();
    const today = new Date().toISOString().split('T')[0];

    const kpi = {
      ...body,
      id: body.repName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      createdAt: today,
      current: body.baseline,
      history: [{ date: today, value: body.baseline, note: 'Baseline inicial' }],
    };

    await addKpi(kpi);
    return NextResponse.json(kpi, { status: 201 });
  } catch (e) {
    console.error('POST /api/kpis error:', e);
    return NextResponse.json({ error: 'Error al crear KPI' }, { status: 500 });
  }
}
