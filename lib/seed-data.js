// ============================================================
// DATOS INICIALES — 24 KPIs (3 por cada uno de los 8 comerciales)
// Basados en los correos enviados a cada comercial el 7 de mayo de 2026
// Fecha límite común: 31 de julio de 2026
// ============================================================

export function getSeedKpis() {
  const today = new Date().toISOString().split('T')[0];
  const reviewDate = '2026-07-31';

  // Helper para crear el objeto KPI con history inicial
  const k = (id, repName, repRole, kpiLabel, kpiType, unit, baseline, target) => ({
    id,
    repName,
    repRole,
    kpiLabel,
    kpiType,
    unit,
    baseline,
    target,
    current: baseline,
    reviewDate,
    createdAt: today,
    history: [{ date: today, value: baseline, note: 'Baseline inicial' }],
  });

  return [
    // ========== 1. LUIS F. WALTEROS (Senior) ==========
    k('luis-walteros-1', 'Luis F. Walteros', 'Senior · defensa de cartera',
      'Promedio mensual de venta', 'monetary', 'COP',
      386_000_000, 460_000_000),

    k('luis-walteros-2', 'Luis F. Walteros', 'Senior · defensa de cartera',
      'Gap mensual recuperado en clientes cayendo', 'monetary', 'COP',
      0, 30_000_000),

    k('luis-walteros-3', 'Luis F. Walteros', 'Senior · defensa de cartera',
      'Reactivación de NEWLAB NUTRITION', 'count', 'facturas/mes',
      0, 1),

    // ========== 2. VANESSA BOHÓRQUEZ (Junior) ==========
    k('vanessa-bohorquez-1', 'Vanessa Bohórquez', 'Junior · cartera V14',
      'Promedio mensual de venta V14', 'monetary', 'COP',
      131_000_000, 165_000_000),

    k('vanessa-bohorquez-2', 'Vanessa Bohórquez', 'Junior · cartera V14',
      'Clientes dormidos rojos altos reactivados', 'count', 'clientes',
      0, 5),

    k('vanessa-bohorquez-3', 'Vanessa Bohórquez', 'Junior · cartera V14',
      'Prospectos asignados activados (primera compra)', 'count', 'clientes',
      0, 3),

    // ========== 3. FABIÁN PACHÓN (Servicio al Cliente) ==========
    k('fabian-pachon-1', 'Fabián Pachón', 'Servicio al Cliente · cartera V10',
      'Promedio mensual de venta personal', 'monetary', 'COP',
      56_700_000, 80_000_000),

    k('fabian-pachon-2', 'Fabián Pachón', 'Servicio al Cliente · cartera V10',
      'Activación de clientes asignados sin venta', 'count', 'clientes',
      0, 25),

    k('fabian-pachon-3', 'Fabián Pachón', 'Servicio al Cliente · cartera V10',
      'Productos distintos vendidos por cliente activo', 'ratio', 'productos/cliente',
      2.17, 3.0),

    // ========== 4. LEONARDO (Senior) ==========
    k('leonardo-1', 'Leonardo', 'Senior · cartera concentrada',
      'Gap recuperado en cuentas top cayendo', 'monetary', 'COP/mes',
      0, 200_000_000),

    k('leonardo-2', 'Leonardo', 'Senior · cartera concentrada',
      'Estado resuelto de cuentas críticas (Lux, Postobón, MANE, Alpina)', 'count', 'cuentas',
      0, 4),

    k('leonardo-3', 'Leonardo', 'Senior · cartera concentrada',
      'Concentración Top 5 clientes (% de venta)', 'ratio', '% venta',
      62.5, 58.0),  // Inverso: bajar es mejor — el cálculo de progress lo maneja correctamente

    // ========== 5. LAURA GARZÓN ==========
    k('laura-garzon-1', 'Laura Garzón', 'Comercial · cartera heredada',
      'Clientes activos en cartera', 'count', 'clientes',
      20, 50),

    k('laura-garzon-2', 'Laura Garzón', 'Comercial · cartera heredada',
      'Promedio mensual de venta', 'monetary', 'COP',
      203_000_000, 240_000_000),

    k('laura-garzon-3', 'Laura Garzón', 'Comercial · cartera heredada',
      'Recuperación cliente Localpack (post-Azelis)', 'monetary', 'COP/mes',
      0, 25_000_000),

    // ========== 6. PAOLA CASTAÑEDA ==========
    k('paola-castaneda-1', 'Paola Castañeda', 'Comercial · cartera amplia',
      'Productos vendidos por cliente', 'ratio', 'productos/cliente',
      2.5, 4.0),

    k('paola-castaneda-2', 'Paola Castañeda', 'Comercial · cartera amplia',
      'Promedio mensual de venta', 'monetary', 'COP',
      167_000_000, 200_000_000),

    k('paola-castaneda-3', 'Paola Castañeda', 'Comercial · cartera amplia',
      'Top 20 clientes dormidos reactivados', 'count', 'clientes',
      0, 7),

    // ========== 7. ORIANA SOLÓRZANO ==========
    k('oriana-solorzano-1', 'Oriana Solórzano', 'Comercial · cartera reasignada',
      'Promedio mensual de venta', 'monetary', 'COP',
      130_000_000, 180_000_000),

    k('oriana-solorzano-2', 'Oriana Solórzano', 'Comercial · cartera reasignada',
      'Clientes con segunda compra repetida en 2026', 'count', 'clientes',
      8, 25),

    k('oriana-solorzano-3', 'Oriana Solórzano', 'Comercial · cartera reasignada',
      'Reemplazo del WPC con cuentas recurrentes', 'monetary', 'COP/mes',
      0, 30_000_000),

    // ========== 8. JUAN DIEGO RIVERA (Junior) ==========
    k('juan-diego-rivera-1', 'Juan Diego Rivera', 'Junior · defensa y diversificación',
      'Gap recuperado en cuentas grandes cayendo', 'monetary', 'COP/mes',
      0, 80_000_000),

    k('juan-diego-rivera-2', 'Juan Diego Rivera', 'Junior · defensa y diversificación',
      'Cuentas grandes con plan de defensa activo (briefing + visita)', 'count', 'cuentas',
      0, 6),

    k('juan-diego-rivera-3', 'Juan Diego Rivera', 'Junior · defensa y diversificación',
      'Diversificación: clientes que aportan el 80% de venta', 'count', 'clientes',
      8, 12),
  ];
}
