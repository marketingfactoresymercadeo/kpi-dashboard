# Seguimiento KPI Comercial — Factores

Tablero de seguimiento de KPIs individuales del equipo comercial, con registro de avance histórico y proyección hacia fecha de revisión.

Construido con Next.js 14 (App Router), React 18, Recharts y Lucide.

---

## Despliegue rápido en Vercel

### Opción A — Desde el navegador (sin instalar nada)

1. **Crea un repo en GitHub** con estos archivos. Puedes subir todo arrastrando la carpeta a github.com/new.

2. **Entra a [vercel.com](https://vercel.com)** y haz login con tu cuenta de GitHub.

3. **Clic en "Add New... → Project"**, selecciona el repo que acabas de crear.

4. **Vercel auto-detecta Next.js.** No necesitas configurar nada. Solo clic en "Deploy".

5. En ~1 minuto tendrás tu URL de producción tipo `kpi-dashboard-xxx.vercel.app`.

### Opción B — Desde tu terminal local (para probar antes)

Necesitas [Node.js 18+](https://nodejs.org) instalado.

```bash
# Instalar dependencias
npm install

# Correr en local
npm run dev
# → abre http://localhost:3000

# Build de producción (opcional, para probar)
npm run build
npm run start
```

Después sigues los pasos 1-5 de la Opción A.

---

## Estructura del proyecto

```
kpi-dashboard/
├── app/
│   ├── layout.jsx          # HTML base + carga de fuentes
│   ├── page.jsx            # Página principal
│   └── globals.css         # Estilos base
├── components/
│   └── KpiDashboard.jsx    # Componente principal (toda la lógica)
├── package.json            # Dependencias
├── next.config.mjs         # Config de Next.js
├── jsconfig.json           # Alias de rutas (@/)
└── .gitignore              # Archivos a ignorar
```

---

## Cómo funciona el almacenamiento

**Actualmente usa `localStorage` del navegador.**

Esto significa:
- ✅ Cero configuración, funciona inmediatamente tras el deploy.
- ✅ Los datos persisten entre sesiones en el mismo navegador.
- ⚠️ **Cada dispositivo/navegador tiene sus propios datos.** Si lo abres en tu laptop y después en tu celular, verás dos conjuntos distintos.
- ⚠️ Si borras el caché del navegador, pierdes los datos.

### Cuándo esto NO es suficiente

Si quieres que varias personas (tú, los 18 comerciales, Don Aldemar) vean **los mismos datos en tiempo real**, tienes que migrar a una base de datos compartida. Las dos rutas más simples en Vercel:

**1. Vercel KV (Redis) — recomendado**
Gratis hasta 30,000 comandos/día. Perfecto para este volumen.
- En tu proyecto de Vercel: Storage → Create Database → KV.
- Conectar al proyecto (genera automáticamente las env vars).
- Reemplazar las funciones `loadFromStorage` / `saveToStorage` en `components/KpiDashboard.jsx` por llamadas a `/api/kpis` que usen `@vercel/kv`.

**2. Supabase**
Si prefieres Postgres o ya tienes cuenta.

Si quieres que te ayude con esta migración cuando estés listo, avísame y te genero el código.

---

## Cómo usar el tablero

**Al entrar por primera vez** carga automáticamente los 4 KPIs definidos con Oriana, Paola, Juan Diego y Laura, con el baseline como primer registro histórico.

**Para registrar avance:**
- Clic en "Registrar avance" desde cualquier tarjeta.
- Ingresa fecha, valor nuevo y nota opcional.
- El histórico se actualiza y el gráfico refleja el cambio.

**Para añadir un nuevo comercial** (a medida que vayas definiendo los KPIs de los otros 14):
- Botón "Añadir comercial" arriba a la derecha.
- Nombre, rol, tipo de KPI (conteo / ratio / monetario), baseline, meta, fecha de revisión.

**Para ver detalle histórico:**
- Clic en cualquier tarjeta → modal con gráfico de evolución, tabla de registros, opciones de editar/eliminar.

**Semáforo automático:**
Cada tarjeta calcula el avance esperado según el tiempo transcurrido y colorea el estado:
- Verde (cumplido / en camino)
- Ámbar (en riesgo — entre 50% y 100% del avance esperado)
- Rojo (atrasado — menos del 50% del avance esperado)
- Azul (inicio — menos de 5% del período transcurrido)

---

## Troubleshooting

**"Module not found: Can't resolve '@/components/KpiDashboard'"**
Revisa que `jsconfig.json` esté en la raíz del proyecto y que el archivo esté en `components/KpiDashboard.jsx`.

**El tablero aparece sin datos después de refrescar**
Asegúrate de estar en el mismo navegador/dispositivo donde creaste los datos. Si cambiaste de navegador, tendrás que volver a definirlos (o migrar a KV).

**Las fuentes se ven genéricas**
La primera carga desde Vercel puede tardar 1-2 segundos en traer las fuentes de Google. Refresca si ves serif de sistema.

---

## Créditos

Diseñado para el equipo comercial de Factores · 2026.
