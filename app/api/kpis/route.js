import { NextResponse } from 'next/server';
import { updateKpi, deleteKpi } from '@/lib/kpi-store';

export const dynamic = 'force-dynamic';

// PUT /api/kpis/[id] — actualizar KPI
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();
    const updated = await updateKpi(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'KPI no encontrado' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    console.error('PUT /api/kpis/[id] error:', e);
    return NextResponse.json({ error: 'Error al actualizar KPI' }, { status: 500 });
  }
}

// DELETE /api/kpis/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteKpi(id);
    return NextResponse.json(result);
  } catch (e) {
    console.error('DELETE /api/kpis/[id] error:', e);
    return NextResponse.json({ error: 'Error al eliminar KPI' }, { status: 500 });
  }
}
