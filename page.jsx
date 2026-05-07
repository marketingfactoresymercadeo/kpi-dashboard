import { NextResponse } from 'next/server';
import { deleteEntry } from '@/lib/kpi-store';

export const dynamic = 'force-dynamic';

// DELETE /api/kpis/[id]/entry/[entryIndex]
export async function DELETE(request, { params }) {
  try {
    const { id, entryIndex } = params;
    const idx = parseInt(entryIndex, 10);
    if (isNaN(idx)) {
      return NextResponse.json({ error: 'Índice inválido' }, { status: 400 });
    }
    const updated = await deleteEntry(id, idx);
    if (!updated) {
      return NextResponse.json({ error: 'KPI no encontrado' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    console.error('DELETE /api/kpis/[id]/entry/[entryIndex] error:', e);
    return NextResponse.json({ error: 'Error al eliminar entrada' }, { status: 500 });
  }
}
