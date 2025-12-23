# Frontend `cotizador-automotriz`

Aplicacion Next.js (App Router) que expone el simulador de creditos/leasing, el dashboard de administracion y la generacion de PDFs de cotizacion.

## 1. Requisitos y configuracion
1. Node.js 18+.
2. Copiar `.env.example` a `.env.local` y ajustar:
   ```env
   NEXT_PUBLIC_BASE_URL_API="http://localhost:3001/api" 
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```

## 2. Scripts
- Desarrollo: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Produccion: `npm start`

## 3. Stack y data layer
- Next.js (App Router) + React 19.
- Redux Toolkit + RTK Query:
  - `src/app/api/api.ts` define `baseQuery` (usa `NEXT_PUBLIC_BASE_URL_API`, fallback `http://localhost:3003/api`) y `tagTypes`.
  - Endpoints por modulo (`authApi`, `companyApi`, `planApi`, `quotationApi`, `userApi`, `vehiculeApi`) inyectan queries/mutations con `URLSearchParams` para paginacion y filtros.
  - Cache se invalida via tags; las ventanas popup envian `postMessage` y se llama `util.invalidateTags` para refrescar tablas.
- Zustand:
  - `useAuthStore`: estado de sesion `{ user, token, isAuthenticated, hydrated }` persistido en localStorage (`auth-storage`), helpers `setAuth`, `logout`, `updateUser`.
  - `createTableStore`: fabrica stores por tabla (`table-${id}`) con filtros, paginacion, orden y toggle de filtros desktop persistidos.
- Formularios: `react-hook-form` + `zod`.
- PDFs: `pdfmake` (`src/app/utils/generateQuotationPdf.ts`).
- Estilos: `globals.css`, componentes UI propios, fuentes Poppins en `public/fonts`.

## 4. Estructura principal
- `src/app/layout.tsx`: monta `ReduxProvider`.
- `src/app/hooks/useAuthRedirect.ts`: protege rutas segun rol.
- `src/app/components`: `NavDashboard` (barra superior responsive), `WindowFormButton` (abre CRUDs en popup), `customTable` (tabla con filtros/paginacion/orden y soporte mobile), inputs/selects reutilizables.
- `src/app/store`: `store.ts` (configureStore + api.middleware), `provider.tsx`, `useAuthStore`, `useTableStore`.
- `src/app/dashboard/*`: vistas del dashboard; `/(CRUDS OUT WINDOWS)` contiene formularios/popup para CRUDs y simulador.
- Tipos en `src/app/types/*` (plans, quotations, vehiculos, users, tablas).

## 5. Patrones reutilizables
- **Tablas** (`components/ui/customTable.tsx`):
  - Usa `createTableStore` para persistir filtros/paginacion/sort por id.
  - `FilterConfig` soporta texto, select, multiselect, selectSearch (con loaders asincronos), fechas y numeros.
  - Incluye paginacion desktop/mobile y acciones comunes via `TableActions`.
- **Ventanas/popup** (`WindowFormButton`):
  - CRUDs y simulador se abren en nueva ventana. Al guardar se publica `postMessage` para invalidar caches RTK Query y refrescar tablas sin recargar la pagina.
- **API layer**:
  - Todas las llamadas agregan el token JWT de `useAuthStore` en `Authorization`.
  - Consultas usan `limit/page/sortBy/sortOrder` y filtros opcionales (companyIds, role, search, etc.).

## 6. Flujo y vistas
- **Autenticacion**: login en `/` (email/password); redirige a `/dashboard` si hay sesion. `useAuthRedirect` protege vistas.
- **Layout**: `dashboard/layout.tsx` con `NavDashboard`:
  - SUPER_ADMIN: Companias, Planes, Vehiculos, Administradores, Superadmins, Usuarios, Historial de cotizaciones.
  - ADMIN: Planes, Vehiculos, Usuarios, Historial de cotizaciones.
  - USER: Planes, Historial de cotizaciones y boton rapido para crear cotizacion.
- **Planes** (`/dashboard/planes`):
  - Tabla con filtros y version vigente. Coeficientes incluyen quebranto, cuota balon y meses de cobro.
  - Edicion genera nueva `PlanVersion`; formularios permiten logo y rangos `desde/hasta`.
- **Vehiculos** (`/dashboard/vehiculos`):
  - CRUD de marcas/lineas/versiones asociadas a companias.
  - Filtros por compania/marca/linea; admin ve solo sus companias.
  - Form acepta marca/linea existente o creacion de nuevas en una transaccion.
- **Usuarios / Administradores / Superadmins**:
  - Tablas filtrables por rol/companias.
  - Solo SUPER_ADMIN crea/edita superadmins; ADMIN gestiona solo usuarios finales.
- **Companias** (`/dashboard/companias`): exclusiva de SUPER_ADMIN.
- **Historial de cotizaciones** (`/dashboard/historial-cotizaciones`):
  - Filtros por texto, compania, version de plan y rango de fechas.
  - Acciones ver/editar/eliminar y generar PDF.
- **Simulador HC** (`/(CRUDS OUT WINDOWS)/HC`):
  - Seleccion de compania, vehiculo y monto; tabla de planes por plazo.
  - Calculo: `cuota = monto * (coeficiente / 10000)`, quebranto con IVA, cuotas balon opcionales y mensajes de inhabilitacion segun rangos `desde/hasta` de `PlanVersion`.
  - Al editar avisa si la cotizacion usa una version de plan historica; PDF recalcula con la misma logica.

## 7. Notas
- Ajusta `NEXT_PUBLIC_BASE_URL_API` si el backend no corre en `3001`; el fallback de `baseQuery` es `http://localhost:3003/api`. 
