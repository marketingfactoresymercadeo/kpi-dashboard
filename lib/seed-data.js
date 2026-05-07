// ============================================================
// CAPA DE ACCESO A UPSTASH REDIS (vía Vercel Marketplace)
// Una sola key 'kpis:all' guarda el array completo (24 KPIs aprox)
// La flag 'kpis:initialized' previene re-seeds accidentales si Mateo borra todo
// ============================================================

import { Redis } from '@upstash/redis';
import { getSeedKpis } from './seed-data';

// Redis.fromEnv() lee KV_REST_API_URL y KV_REST_API_TOKEN automáticamente
// (estas son las variables que Vercel inyecta cuando agregas Upstash desde el Marketplace)
const redis = Redis.fromEnv();

const KEY_KPIS = 'kpis:all';
const KEY_INIT = 'kpis:initialized';

/**
 * Obtiene todos los KPIs.
 * Si la BD nunca se ha inicializado, hace auto-seed con los 24 KPIs.
 */
export async function getAllKpis() {
  const initialized = await redis.get(KEY_INIT);

  if (!initialized) {
    // Primera vez: poblar con los 24 KPIs y marcar como inicializado
    const seed = getSeedKpis();
    await redis.set(KEY_KPIS, seed);
    await redis.set(KEY_INIT, true);
    return seed;
  }

  const kpis = await redis.get(KEY_KPIS);
  return kpis || [];
}

/**
 * Reemplaza todo el array de KPIs.
 */
export async function saveAllKpis(kpis) {
  await redis.set(KEY_KPIS, kpis);
  // Aseguramos que la flag esté seteada incluso si alguien borra todo
  await redis.set(KEY_INIT, true);
  return kpis;
}

/**
 * Agrega un KPI nuevo.
 */
export async function addKpi(kpi) {
  const all = await getAllKpis();
  const updated = [...all, kpi];
  await saveAllKpis(updated);
  return kpi;
}

/**
 * Actualiza un KPI por ID (merge parcial).
 */
export async function updateKpi(id, updates) {
  const all = await getAllKpis();
  const updated = all.map(k => k.id === id ? { ...k, ...updates } : k);
  await saveAllKpis(updated);
  return updated.find(k => k.id === id);
}

/**
 * Elimina un KPI por ID.
 */
export async function deleteKpi(id) {
  const all = await getAllKpis();
  const updated = all.filter(k => k.id !== id);
  await saveAllKpis(updated);
  return { id, deleted: true };
}

/**
 * Registra una entrada de avance en el history del KPI y actualiza current.
 */
export async function logEntry(id, entry) {
  const all = await getAllKpis();
  const updated = all.map(k => {
    if (k.id !== id) return k;
    const newHistory = [...(k.history || []), entry].sort((a, b) => a.date.localeCompare(b.date));
    return { ...k, history: newHistory, current: entry.value };
  });
  await saveAllKpis(updated);
  return updated.find(k => k.id === id);
}

/**
 * Elimina una entrada del history (por índice) y recalcula current.
 */
export async function deleteEntry(kpiId, entryIndex) {
  const all = await getAllKpis();
  const updated = all.map(k => {
    if (k.id !== kpiId) return k;
    const newHistory = (k.history || []).filter((_, i) => i !== entryIndex);
    const lastValue = newHistory.length > 0 ? newHistory[newHistory.length - 1].value : k.baseline;
    return { ...k, history: newHistory, current: lastValue };
  });
  await saveAllKpis(updated);
  return updated.find(k => k.id === kpiId);
}

/**
 * RESET TOTAL — borra todo y vuelve a poblar con los 24 KPIs seed.
 * Útil si Mateo quiere "reiniciar" todo el dashboard.
 */
export async function resetToSeed() {
  const seed = getSeedKpis();
  await redis.set(KEY_KPIS, seed);
  await redis.set(KEY_INIT, true);
  return seed;
}
