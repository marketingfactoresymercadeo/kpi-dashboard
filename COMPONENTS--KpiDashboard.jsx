'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus, X, Users, Package, DollarSign, Edit3, Trash2, ChevronRight, Target, Activity } from 'lucide-react';

// ============================================================
// DESIGN TOKENS
// ============================================================
const COLORS = {
  bg: '#F7F3EC',
  surface: '#FFFFFF',
  ink: '#1A2436',
  muted: '#6B7380',
  subtle: '#A8A69C',
  border: '#E5DED0',
  borderSoft: '#EEE8D9',
  primary: '#185FA5',
  primaryDark: '#0C447C',
  primarySoft: '#E6F1FB',
  success: '#2D7D4F',
  successSoft: '#E8F1E5',
  warning: '#B07620',
  warningSoft: '#FAEEDA',
  danger: '#C33F3F',
  dangerSoft: '#FCEBEB',
};

const STORAGE_KEY = 'kpi_dashboard_v1';

// ============================================================
// DEFAULT SEED DATA (as function to avoid SSR hydration issues)
// ============================================================
function getDefaultKpis() {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'oriana-solorzano',
      repName: 'Oriana Solórzano',
      repRole: 'Cartera mixta en reconstrucción',
      kpiLabel: 'Productos vendidos por cliente',
      kpiType: 'ratio',
      unit: 'productos/cliente',
      baseline: 4.1,
      target: 5.1,
      current: 4.1,
      reviewDate: '2026-05-20',
      createdAt: today,
      history: [{ date: today, value: 4.1, note: 'Baseline inicial' }],
    },
    {
      id: 'paola-castaneda',
      repName: 'Paola Castañeda',
      repRole: 'Cartera amplia con potencial de reactivación',
      kpiLabel: 'Productos vendidos por cliente',
      kpiType: 'ratio',
      unit: 'productos/cliente',
      baseline: 2.5,
      target: 4.0,
      current: 2.5,
      reviewDate: '2026-05-20',
      createdAt: today,
      history: [{ date: today, value: 2.5, note: 'Baseline inicial' }],
    },
    {
      id: 'juan-diego-rivera',
      repName: 'Juan Diego Rivera',
      repRole: 'Cartera consolidada con rotación interna',
      kpiLabel: 'Ticket promedio',
      kpiType: 'monetary',
      unit: 'COP',
      baseline: 1301000,
      target: 1561200,
      current: 1301000,
      reviewDate: '2026-05-20',
      createdAt: today,
      history: [{ date: today, value: 1301000, note: 'Baseline inicial (+20% objetivo)' }],
    },
    {
      id: 'laura-garzon',
      repName: 'Laura Garzón',
      repRole: 'Cartera concentrada con cuentas de alto volumen',
      kpiLabel: 'Clientes activos en cartera',
      kpiType: 'count',
      unit: 'clientes',
      baseline: 20,
      target: 50,
      current: 20,
      reviewDate: '2026-05-20',
      createdAt: today,
      history: [{ date: today, value: 20, note: 'Baseline inicial' }],
    },
  ];
}

// ============================================================
// STORAGE (localStorage)
// ============================================================
function loadFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return null;
  }
}

function saveToStorage(data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage:', e);
  }
}

// ============================================================
// HELPERS
// ============================================================
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatValue(v, type) {
  if (v == null || isNaN(v)) return '—';
  if (type === 'monetary') {
    return '$' + Math.round(v).toLocaleString('es-CO');
  }
  if (type === 'ratio') {
    return v.toFixed(2);
  }
  return Math.round(v).toLocaleString('es-CO');
}

function formatShort(v, type) {
  if (v == null || isNaN(v)) return '—';
  if (type === 'monetary') {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
    return '$' + v.toFixed(0);
  }
  if (type === 'ratio') return v.toFixed(2);
  return Math.round(v).toLocaleString('es-CO');
}

function getProgress(kpi) {
  const delta = kpi.current - kpi.baseline;
  const goal = kpi.target - kpi.baseline;
  if (goal === 0) return 0;
  return Math.max(0, delta / goal);
}

function getTimeProgress(kpi) {
  const start = new Date(kpi.createdAt).getTime();
  const end = new Date(kpi.reviewDate).getTime();
  const now = Date.now();
  if (end <= start) return 1;
  const elapsed = now - start;
  const total = end - start;
  return Math.max(0, Math.min(1, elapsed / total));
}

function getStatus(kpi) {
  const progress = getProgress(kpi);
  const timeProgress = getTimeProgress(kpi);

  if (progress >= 1.0) return 'achieved';
  if (timeProgress < 0.05) return 'starting';
  if (progress >= timeProgress) return 'on_track';
  if (progress >= timeProgress * 0.5) return 'at_risk';
  return 'behind';
}

function getStatusConfig(status) {
  switch (status) {
    case 'achieved':
      return { label: 'Cumplido', color: COLORS.success, bg: COLORS.successSoft };
    case 'on_track':
      return { label: 'En camino', color: COLORS.success, bg: COLORS.successSoft };
    case 'starting':
      return { label: 'Inicio', color: COLORS.primary, bg: COLORS.primarySoft };
    case 'at_risk':
      return { label: 'En riesgo', color: COLORS.warning, bg: COLORS.warningSoft };
    case 'behind':
      return { label: 'Atrasado', color: COLORS.danger, bg: COLORS.dangerSoft };
    default:
      return { label: '—', color: COLORS.muted, bg: COLORS.borderSoft };
  }
}

function daysUntil(dateStr) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function daysSince(dateStr) {
  const from = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - from) / (1000 * 60 * 60 * 24));
}

function getKpiIcon(type) {
  switch (type) {
    case 'ratio': return Package;
    case 'monetary': return DollarSign;
    case 'count': return Users;
    default: return Activity;
  }
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// MAIN APP
// ============================================================
export default function KpiDashboard() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [logging, setLogging] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setMounted(true);
    const saved = loadFromStorage();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setKpis(saved);
    } else {
      const defaults = getDefaultKpis();
      setKpis(defaults);
      saveToStorage(defaults);
    }
    setLoading(false);
  }, []);

  function saveAll(newKpis) {
    setKpis(newKpis);
    saveToStorage(newKpis);
  }

  function handleAdd(newKpi) {
    const today = getToday();
    const kpi = {
      ...newKpi,
      id: newKpi.repName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      createdAt: today,
      current: newKpi.baseline,
      history: [{ date: today, value: newKpi.baseline, note: 'Baseline inicial' }],
    };
    saveAll([...kpis, kpi]);
    setAdding(false);
  }

  function handleEdit(id, updated) {
    const newKpis = kpis.map(k => k.id === id ? { ...k, ...updated } : k);
    saveAll(newKpis);
    setEditing(null);
  }

  function handleDelete(id) {
    if (!window.confirm('¿Seguro que quieres eliminar este KPI? Esta acción no se puede deshacer.')) return;
    saveAll(kpis.filter(k => k.id !== id));
    setSelected(null);
  }

  function handleLog(id, entry) {
    const newKpis = kpis.map(k => {
      if (k.id !== id) return k;
      const newHistory = [...k.history, entry].sort((a, b) => a.date.localeCompare(b.date));
      return { ...k, current: entry.value, history: newHistory };
    });
    saveAll(newKpis);
    setLogging(null);
  }

  function handleDeleteEntry(kpiId, entryIndex) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    const newKpis = kpis.map(k => {
      if (k.id !== kpiId) return k;
      const newHistory = k.history.filter((_, i) => i !== entryIndex);
      const lastValue = newHistory.length > 0 ? newHistory[newHistory.length - 1].value : k.baseline;
      return { ...k, history: newHistory, current: lastValue };
    });
    saveAll(newKpis);
    const updated = newKpis.find(k => k.id === kpiId);
    if (updated) setSelected(updated);
  }

  const summary = useMemo(() => {
    const counts = { total: kpis.length, achieved: 0, on_track: 0, starting: 0, at_risk: 0, behind: 0 };
    kpis.forEach(k => {
      const s = getStatus(k);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [kpis]);

  // Avoid SSR hydration mismatch: render loading state until mounted on client
  if (!mounted || loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.muted }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.ink }}>
      <style>{`
        .serif { font-family: 'Fraunces', Georgia, serif; font-variation-settings: 'opsz' 144; }
        .mono { font-family: 'JetBrains Mono', 'Courier New', monospace; font-variant-numeric: tabular-nums; }
        .hover-lift { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26, 36, 54, 0.08); }
        .btn-primary { background: ${COLORS.ink}; color: ${COLORS.bg}; padding: 10px 18px; border: none; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s; }
        .btn-primary:hover { background: #0A1220; }
        .btn-secondary { background: transparent; color: ${COLORS.ink}; padding: 10px 18px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s; }
        .btn-secondary:hover { background: ${COLORS.surface}; border-color: ${COLORS.muted}; }
        .btn-ghost { background: transparent; color: ${COLORS.muted}; padding: 8px 12px; border: none; border-radius: 6px; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s, color 0.15s; }
        .btn-ghost:hover { background: ${COLORS.borderSoft}; color: ${COLORS.ink}; }
        .btn-danger { background: transparent; color: ${COLORS.danger}; padding: 8px 12px; border: 1px solid ${COLORS.border}; border-radius: 6px; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
        .btn-danger:hover { background: ${COLORS.dangerSoft}; border-color: ${COLORS.danger}; }
        .input { width: 100%; padding: 10px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-family: inherit; font-size: 14px; color: ${COLORS.ink}; background: ${COLORS.surface}; transition: border-color 0.15s; }
        .input:focus { outline: none; border-color: ${COLORS.primary}; }
        .select { width: 100%; padding: 10px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-family: inherit; font-size: 14px; color: ${COLORS.ink}; background: ${COLORS.surface}; cursor: pointer; }
        .label { font-size: 12px; font-weight: 500; color: ${COLORS.muted}; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(26, 36, 54, 0.55); z-index: 50; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; overflow-y: auto; }
        .modal { background: ${COLORS.bg}; border-radius: 16px; width: 100%; max-width: 640px; padding: 32px; position: relative; }
        .modal-wide { max-width: 900px; }
      `}</style>

      <Header kpis={kpis} />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 80px' }}>
        <SummaryStrip summary={summary} kpiCount={kpis.length} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
            Seguimiento individual
          </h2>
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Añadir comercial
          </button>
        </div>

        {kpis.length === 0 ? (
          <EmptyState onAdd={() => setAdding(true)} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
            {kpis.map(kpi => (
              <KpiCard
                key={kpi.id}
                kpi={kpi}
                onSelect={() => setSelected(kpi)}
                onLog={() => setLogging(kpi)}
              />
            ))}
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 32, borderTop: `1px solid ${COLORS.border}`, textAlign: 'center', color: COLORS.subtle, fontSize: 13 }}>
          Los datos se guardan en este dispositivo. Factores · Equipo comercial.
        </footer>
      </main>

      {adding && <AddKpiModal onClose={() => setAdding(false)} onAdd={handleAdd} />}
      {selected && (
        <DetailModal
          kpi={kpis.find(k => k.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); }}
          onDelete={() => handleDelete(selected.id)}
          onLog={() => { setLogging(selected); setSelected(null); }}
          onDeleteEntry={(idx) => handleDeleteEntry(selected.id, idx)}
        />
      )}
      {editing && <EditKpiModal kpi={editing} onClose={() => setEditing(null)} onSave={(data) => handleEdit(editing.id, data)} />}
      {logging && <LogModal kpi={logging} onClose={() => setLogging(null)} onLog={(entry) => handleLog(logging.id, entry)} />}
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({ kpis }) {
  const nextReview = kpis.length > 0
    ? kpis.reduce((earliest, k) => k.reviewDate < earliest ? k.reviewDate : earliest, kpis[0].reviewDate)
    : null;
  const daysLeft = nextReview ? daysUntil(nextReview) : null;

  return (
    <header style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg, position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontWeight: 500 }}>
              Equipo comercial · Factores
            </div>
            <h1 className="serif" style={{ fontSize: 48, fontWeight: 400, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.05, color: COLORS.ink }}>
              Seguimiento <em style={{ fontStyle: 'italic', color: COLORS.primary }}>KPI</em>
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 15, marginTop: 10, marginBottom: 0 }}>
              Tablero de avance individual hacia la próxima revisión
            </p>
          </div>

          {daysLeft != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 4 }}>
                  Próxima revisión
                </div>
                <div style={{ fontSize: 14, color: COLORS.ink, fontWeight: 500 }}>
                  {new Date(nextReview + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: COLORS.border }} />
              <div style={{ textAlign: 'right' }}>
                <div className="serif mono" style={{ fontSize: 40, fontWeight: 500, color: daysLeft < 14 ? COLORS.danger : COLORS.ink, lineHeight: 1 }}>
                  {daysLeft}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginTop: 4 }}>
                  días restantes
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// SUMMARY STRIP
// ============================================================
function SummaryStrip({ summary, kpiCount }) {
  if (kpiCount === 0) return null;

  const items = [
    { label: 'KPIs activos', value: summary.total, color: COLORS.ink },
    { label: 'Cumplidos', value: summary.achieved, color: COLORS.success },
    { label: 'En camino', value: summary.on_track + summary.starting, color: COLORS.primary },
    { label: 'En riesgo', value: summary.at_risk, color: COLORS.warning },
    { label: 'Atrasados', value: summary.behind, color: COLORS.danger },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 40 }}>
      {items.map(item => (
        <div
          key={item.label}
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: '20px 22px',
          }}
        >
          <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 8 }}>
            {item.label}
          </div>
          <div className="serif mono" style={{ fontSize: 32, fontWeight: 500, color: item.color, lineHeight: 1 }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================
function KpiCard({ kpi, onSelect, onLog }) {
  const progress = getProgress(kpi);
  const timeProgress = getTimeProgress(kpi);
  const status = getStatus(kpi);
  const statusConfig = getStatusConfig(status);
  const Icon = getKpiIcon(kpi.kpiType);
  const lastUpdate = kpi.history.length > 0 ? kpi.history[kpi.history.length - 1] : null;
  const daysSinceUpdate = lastUpdate ? daysSince(lastUpdate.date) : null;

  const percentComplete = Math.min(100, Math.round(progress * 100));

  return (
    <div
      className="hover-lift"
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 24,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
      onClick={onSelect}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: COLORS.primarySoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.primary,
          fontSize: 14,
          fontWeight: 600,
          flexShrink: 0,
        }}>
          {getInitials(kpi.repName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: COLORS.ink, lineHeight: 1.2, marginBottom: 4 }}>
            {kpi.repName}
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.3 }}>
            {kpi.repRole || ''}
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: 6,
          background: statusConfig.bg,
          color: statusConfig.color,
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}>
          {statusConfig.label}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.muted, fontSize: 13 }}>
        <Icon size={14} />
        <span style={{ fontWeight: 500 }}>{kpi.kpiLabel}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 4 }}>
            Actual
          </div>
          <div className="serif mono" style={{ fontSize: 36, fontWeight: 500, color: COLORS.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {formatShort(kpi.current, kpi.kpiType)}
          </div>
        </div>
        <div style={{ color: COLORS.subtle, fontSize: 18 }}>→</div>
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 4 }}>
            Meta
          </div>
          <div className="serif mono" style={{ fontSize: 24, fontWeight: 400, color: COLORS.muted, lineHeight: 1 }}>
            {formatShort(kpi.target, kpi.kpiType)}
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500 }}>
            desde {formatShort(kpi.baseline, kpi.kpiType)}
          </span>
          <span className="mono" style={{ fontSize: 12, color: statusConfig.color, fontWeight: 600 }}>
            {percentComplete}%
          </span>
        </div>
        <div style={{ position: 'relative', height: 6, background: COLORS.borderSoft, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.min(100, percentComplete)}%`,
            background: statusConfig.color,
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
          {timeProgress > 0 && timeProgress < 1 && (
            <div style={{
              position: 'absolute',
              left: `${timeProgress * 100}%`,
              top: -3,
              bottom: -3,
              width: 1.5,
              background: COLORS.ink,
              opacity: 0.4,
            }} title={`Progreso esperado: ${Math.round(timeProgress * 100)}%`} />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ fontSize: 12, color: COLORS.muted }}>
          {daysSinceUpdate === 0 ? 'Actualizado hoy' : daysSinceUpdate === 1 ? 'Ayer' : `Hace ${daysSinceUpdate} días`}
        </div>
        <button
          className="btn-ghost"
          onClick={(e) => { e.stopPropagation(); onLog(); }}
          style={{ padding: '4px 10px' }}
        >
          Registrar avance <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ onAdd }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      border: `1.5px dashed ${COLORS.border}`,
      borderRadius: 16,
      background: COLORS.surface,
    }}>
      <Target size={32} style={{ color: COLORS.subtle, margin: '0 auto 16px' }} />
      <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: COLORS.ink, margin: '0 0 8px' }}>
        No hay KPIs registrados
      </h3>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>
        Añade el primer comercial con su objetivo para empezar a hacer seguimiento.
      </p>
      <button className="btn-primary" onClick={onAdd}>
        <Plus size={16} /> Añadir comercial
      </button>
    </div>
  );
}

// ============================================================
// DETAIL MODAL
// ============================================================
function DetailModal({ kpi, onClose, onEdit, onDelete, onLog, onDeleteEntry }) {
  const progress = getProgress(kpi);
  const timeProgress = getTimeProgress(kpi);
  const status = getStatus(kpi);
  const statusConfig = getStatusConfig(status);

  const chartData = useMemo(() => {
    return kpi.history.map(h => ({
      date: h.date,
      value: h.value,
      note: h.note || '',
      label: new Date(h.date + 'T12:00:00').toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
    }));
  }, [kpi.history]);

  const chartMin = Math.min(kpi.baseline, kpi.target, ...kpi.history.map(h => h.value));
  const chartMax = Math.max(kpi.baseline, kpi.target, ...kpi.history.map(h => h.value));
  const padding = (chartMax - chartMin) * 0.15 || 1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: COLORS.muted,
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            display: 'flex',
          }}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: COLORS.primarySoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.primary,
            fontSize: 18,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {getInitials(kpi.repName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, color: COLORS.ink, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              {kpi.repName}
            </h2>
            <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 10 }}>
              {kpi.repRole || ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: statusConfig.bg,
                color: statusConfig.color,
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {statusConfig.label}
              </span>
              <span style={{ fontSize: 13, color: COLORS.muted }}>
                {kpi.kpiLabel}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
          <MetricCell label="Baseline" value={formatValue(kpi.baseline, kpi.kpiType)} sub={kpi.unit} />
          <MetricCell label="Actual" value={formatValue(kpi.current, kpi.kpiType)} sub={kpi.unit} emphasis />
          <MetricCell label="Meta" value={formatValue(kpi.target, kpi.kpiType)} sub={kpi.unit} />
          <MetricCell label="Avance" value={`${Math.round(progress * 100)}%`} sub={`esperado ${Math.round(timeProgress * 100)}%`} />
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 className="serif" style={{ fontSize: 18, fontWeight: 500, color: COLORS.ink, margin: 0 }}>
              Evolución
            </h3>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: COLORS.muted, flexWrap: 'wrap' }}>
              <LegendDot color={COLORS.primary} label="Registros" />
              <LegendDot color={COLORS.success} label="Meta" dashed />
              <LegendDot color={COLORS.subtle} label="Baseline" dashed />
            </div>
          </div>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
                <CartesianGrid stroke={COLORS.borderSoft} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={COLORS.muted} style={{ fontSize: 11 }} tickLine={false} />
                <YAxis
                  stroke={COLORS.muted}
                  style={{ fontSize: 11 }}
                  tickLine={false}
                  domain={[chartMin - padding, chartMax + padding]}
                  tickFormatter={(v) => formatShort(v, kpi.kpiType)}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatValue(v, kpi.kpiType)}
                  labelStyle={{ color: COLORS.ink, fontWeight: 500 }}
                />
                <ReferenceLine y={kpi.baseline} stroke={COLORS.subtle} strokeDasharray="4 4" />
                <ReferenceLine y={kpi.target} stroke={COLORS.success} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2.5} dot={{ fill: COLORS.primary, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 className="serif" style={{ fontSize: 18, fontWeight: 500, color: COLORS.ink, margin: '0 0 12px' }}>
            Registros ({kpi.history.length})
          </h3>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {kpi.history.slice().reverse().map((h, revIdx) => {
              const originalIdx = kpi.history.length - 1 - revIdx;
              const isFirst = originalIdx === 0;
              return (
                <div
                  key={`${h.date}-${originalIdx}`}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    borderTop: revIdx === 0 ? 'none' : `1px solid ${COLORS.borderSoft}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
                    <div className="mono" style={{ fontSize: 12, color: COLORS.muted, width: 80, flexShrink: 0 }}>
                      {new Date(h.date + 'T12:00:00').toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 500, color: COLORS.ink, minWidth: 80 }}>
                      {formatValue(h.value, kpi.kpiType)}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.muted, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.note || '—'}
                    </div>
                  </div>
                  {!isFirst && (
                    <button
                      onClick={() => onDeleteEntry(originalIdx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: COLORS.subtle,
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 4,
                        display: 'flex',
                      }}
                      aria-label="Eliminar registro"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 20, borderTop: `1px solid ${COLORS.border}`, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onLog}>
            <Plus size={16} /> Registrar avance
          </button>
          <button className="btn-secondary" onClick={onEdit}>
            <Edit3 size={14} /> Editar KPI
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn-danger" onClick={onDelete}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCell({ label, value, sub, emphasis }) {
  return (
    <div style={{
      background: emphasis ? COLORS.primarySoft : COLORS.surface,
      border: `1px solid ${emphasis ? COLORS.primarySoft : COLORS.border}`,
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 6 }}>
        {label}
      </div>
      <div className="serif mono" style={{ fontSize: 22, fontWeight: 500, color: emphasis ? COLORS.primary : COLORS.ink, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: COLORS.muted }}>
        {sub}
      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        display: 'inline-block',
        width: 16,
        height: dashed ? 0 : 8,
        borderTop: dashed ? `2px dashed ${color}` : 'none',
        background: dashed ? 'none' : color,
        borderRadius: dashed ? 0 : 2,
      }} />
      {label}
    </span>
  );
}

// ============================================================
// ADD / EDIT KPI MODAL
// ============================================================
function AddKpiModal({ onClose, onAdd }) {
  return <KpiForm title="Añadir comercial y KPI" onClose={onClose} onSubmit={onAdd} submitLabel="Crear KPI" />;
}

function EditKpiModal({ kpi, onClose, onSave }) {
  return <KpiForm title="Editar KPI" initial={kpi} onClose={onClose} onSubmit={onSave} submitLabel="Guardar cambios" isEditing />;
}

function KpiForm({ title, initial, onClose, onSubmit, submitLabel, isEditing }) {
  const [repName, setRepName] = useState(initial?.repName || '');
  const [repRole, setRepRole] = useState(initial?.repRole || '');
  const [kpiLabel, setKpiLabel] = useState(initial?.kpiLabel || '');
  const [kpiType, setKpiType] = useState(initial?.kpiType || 'count');
  const [unit, setUnit] = useState(initial?.unit || '');
  const [baseline, setBaseline] = useState(initial?.baseline ?? '');
  const [target, setTarget] = useState(initial?.target ?? '');
  const [reviewDate, setReviewDate] = useState(initial?.reviewDate || '2026-05-20');

  const typeOptions = [
    { value: 'count', label: 'Conteo (clientes, pedidos, llamadas)', defaultUnit: 'clientes' },
    { value: 'ratio', label: 'Ratio (productos/cliente, conversión)', defaultUnit: 'productos/cliente' },
    { value: 'monetary', label: 'Monetario (ticket, revenue)', defaultUnit: 'COP' },
  ];

  function handleTypeChange(newType) {
    setKpiType(newType);
    const opt = typeOptions.find(o => o.value === newType);
    if (!unit || typeOptions.some(o => o.defaultUnit === unit)) {
      setUnit(opt?.defaultUnit || '');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const b = parseFloat(baseline);
    const t = parseFloat(target);
    if (!repName.trim() || !kpiLabel.trim() || isNaN(b) || isNaN(t)) {
      window.alert('Completa todos los campos requeridos');
      return;
    }
    onSubmit({
      repName: repName.trim(),
      repRole: repRole.trim(),
      kpiLabel: kpiLabel.trim(),
      kpiType,
      unit: unit.trim(),
      baseline: b,
      target: t,
      reviewDate,
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', padding: 8, display: 'flex' }}
        >
          <X size={20} />
        </button>

        <h2 className="serif" style={{ fontSize: 24, fontWeight: 500, color: COLORS.ink, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
          {title}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="label">Nombre del comercial</label>
            <input className="input" value={repName} onChange={(e) => setRepName(e.target.value)} placeholder="Ej: María Pérez" autoFocus={!isEditing} />
          </div>
          <div>
            <label className="label">Rol / contexto</label>
            <input className="input" value={repRole} onChange={(e) => setRepRole(e.target.value)} placeholder="Ej: Cartera de clientes farma" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">KPI</label>
          <input className="input" value={kpiLabel} onChange={(e) => setKpiLabel(e.target.value)} placeholder="Ej: Clientes activos en cartera" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="label">Tipo de métrica</label>
            <select className="select" value={kpiType} onChange={(e) => handleTypeChange(e.target.value)}>
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Unidad (opcional)</label>
            <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Ej: clientes, COP, productos/cliente" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div>
            <label className="label">Valor inicial</label>
            <input className="input mono" type="number" step="any" value={baseline} onChange={(e) => setBaseline(e.target.value)} placeholder="0" disabled={isEditing} />
            {isEditing && <div style={{ fontSize: 11, color: COLORS.subtle, marginTop: 4 }}>No editable</div>}
          </div>
          <div>
            <label className="label">Meta</label>
            <input className="input mono" type="number" step="any" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">Fecha revisión</label>
            <input className="input mono" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${COLORS.border}`, flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{submitLabel}</button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// LOG ENTRY MODAL
// ============================================================
function LogModal({ kpi, onClose, onLog }) {
  const [date, setDate] = useState(getToday());
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const v = parseFloat(value);
    if (isNaN(v)) {
      window.alert('Ingresa un valor numérico válido');
      return;
    }
    onLog({ date, value: v, note: note.trim() });
  }

  const diff = parseFloat(value) - kpi.current;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', padding: 8, display: 'flex' }}
        >
          <X size={20} />
        </button>

        <div style={{ fontSize: 12, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 8 }}>
          Registrar avance
        </div>
        <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, color: COLORS.ink, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          {kpi.repName}
        </h2>
        <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 24 }}>
          {kpi.kpiLabel} · actual: <span className="mono" style={{ color: COLORS.ink, fontWeight: 500 }}>{formatValue(kpi.current, kpi.kpiType)} {kpi.unit}</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Fecha del registro</label>
          <input className="input mono" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Valor nuevo ({kpi.unit || 'sin unidad'})</label>
          <input
            className="input mono"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={formatValue(kpi.current, kpi.kpiType)}
            autoFocus
          />
          {!isNaN(diff) && value !== '' && (
            <div style={{ fontSize: 12, color: diff >= 0 ? COLORS.success : COLORS.danger, marginTop: 6, fontWeight: 500 }}>
              {diff >= 0 ? '▲' : '▼'} {formatValue(Math.abs(diff), kpi.kpiType)} {kpi.unit} vs. registro anterior
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="label">Nota (opcional)</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Reactivación de 3 clientes dormidos"
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${COLORS.border}`, flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">Guardar registro</button>
        </div>
      </form>
    </div>
  );
}
