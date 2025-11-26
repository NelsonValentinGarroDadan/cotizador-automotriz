# Cotizador Automotriz (API + Frontend)

Monorepo del simulador de creditos y leasing vehicular basado en el Excel de referencia. Contiene una API en Express + TypeScript + Prisma (MySQL) y un frontend en Next.js (App Router) con React y Redux Toolkit.

---

## 1. Backend — `cotizador-api`

### 1.1 Stack y dependencias
- Node.js + TypeScript (`ts-node-dev` en dev, `tsc` en build).
- Express 5 con `cors`, `morgan` y `express.json`.
- Prisma ORM (`@prisma/client`, `prisma`) contra MySQL.
- Autenticacion: JWT (`jsonwebtoken`) y `bcrypt`/`bcryptjs`.
- Validacion: `zod` + middleware `validateRequest`.
- Uploads: `multer` + `sharp` para logos, servidos en `/uploads`.
- Utilidades: `catchAsync`, paginacion (`pagination.ts`), manejo de errores (`AppError`, `errorHandler`).

### 1.2 Estructura de carpetas (src)
- `app.ts` / `server.ts`: bootstrap de Express y listener.
- `config/prisma.ts`: Prisma Client singleton.
- `core/errors`: `AppError` y middleware global.
- `core/middleware`: `authMiddleware` (inyecta `req.user`), `authorizeRole`, `validateRequest`, `uploadLogo`.
- `routes/route.ts`: monta `/api` y agrupa modulos.
- `modules/*`:
  - `auth`: login y emision de JWT.
  - `users`: CRUD con filtros; asignacion de `allowedPlans` y `user_companies`.
  - `companies`: CRUD; alta vincula al creador; incluye estadisticas de roles.
  - `plans`: plan + versionado + coeficientes + cuota balon; controla visibilidad por companias y usuarios permitidos.
  - `qoutation`: cotizaciones ligadas a planVersion, compania, usuario y version de vehiculo.
  - `vehicules`: marcas/lineas/versiones de autos, asociadas a companias.
- `utils`: `pagination.ts` (normaliza sort/limit/page) y helpers varios.

### 1.3 Modelos y datos (Prisma)
- Roles (`Role`): `SUPER_ADMIN`, `ADMIN`, `USER`.
- Usuario (`User`): relacion `user_companies`, planes creados, planes permitidos (`allowedPlans`), cotizaciones y plan versions creadas.
- Compania (`Company`): logo opcional; relacion con usuarios, planes, cotizaciones y vehiculos (`AutosVersion`).
- Plan (`Plan`):
  - Versionado en `PlanVersion` con `isLatest`, `version` incremental y rangos `desdeMonto/hastaMonto`, `desdeCuota/hastaCuota`.
  - Coeficientes en `PlanCoefficient` (plazo, tna, coeficiente, quebranto financiero, cuota balon y meses de cuota balon).
  - Visibilidad por companias y por `allowedUsers`.
- Cotizacion (`Quotation`): referencia obligatoria a `planVersion`, `company`, `user` y `vehicleVersion`; `totalValue` opcional.
- Catalogo de vehiculos: `autos_marcas`, `autos_lineas`, `autos_versiones` asociables a companias (`CompanyVehicles`).

### 1.4 Roles y permisos
- `SUPER_ADMIN`: sin restricciones. Unico que crea/edita/borra companias y usuarios `ADMIN`/`SUPER_ADMIN`; ve todos los planes, vehiculos y cotizaciones.
- `ADMIN`: limitado a companias de `user_companies`. CRUD de planes, vehiculos y usuarios `USER`; ve cotizaciones de sus companias y valida que planes/vehiculos pertenezcan a ellas.
- `USER`: accede solo a planes en `allowedPlans` y a sus cotizaciones. No crea planes, vehiculos ni companias.

### 1.5 Rutas y reglas relevantes
- `/auth/login`: email/password → `{ token, user }` (JWT 24h).
- `/users` (ADMIN+SUPER_ADMIN): filtros por rol/companias/fecha; solo SUPER_ADMIN puede asignar roles altos; al editar valida que planes permitidos pertenezcan a companias del usuario.
- `/companies`:
  - GET protegido por autenticacion; SUPER_ADMIN administra CRUD con logo.
  - Alta vincula automaticamente al creador en `user_companies`.
- `/plans` (ADMIN+SUPER_ADMIN para mutaciones):
  - Versionado automatico: nuevos coeficientes → nueva `PlanVersion` y `isLatest=false` en anteriores.
  - Rangos de uso de plan por monto/plazo expuestos al simulador y PDF.
  - Usuarios finales solo ven planes donde estan en `allowedUsers`.
- `/quotations`: CRUD autenticado. ADMIN/SUPER_ADMIN ven por companias; USER solo las propias. Valida que el vehiculo pertenezca a la compania y que el plan sea accesible.
- `/vehicules` (ADMIN+SUPER_ADMIN para CRUD):
  - Marcas (`/brands`), lineas (`/lines`), versiones (`/versions`).
  - Admins solo gestionan vehiculos conectados a sus companias. Crear version acepta marca/linea existente o nuevas en una transaccion; `companyIds` obligatorio.

### 1.6 Datos seed y migraciones destacadas
- Esquema en `prisma/schema.prisma`.
- Migraciones con datos de referencia:
  - `20251118123000_add_autos_catalog` y `20251118124000_seed_autos_from_laboratorio`: cargan catalogo base de autos desde `laboratorio.sql`.
  - `20251120170000_seed_excel_plans`: importa planes, coeficientes y usuarios desde el Excel con ids deterministas y logos en `uploads/plans`; asigna `allowedPlans` a usuarios y escala TNA/quebranto.
  - Otras migraciones: `add_role_super_admin`, `make_quotation_vehicle_required`, relaciones plan-companies y company-vehicles.

### 1.7 Configuracion y scripts
- Variables: `.env.example`. Definir `DATABASE_URL`, `PORT` (3001 por defecto) y `JWT_SECRET` (usa `"secret"` si falta).
- Scripts:
  - Desarrollo: `npm run dev`.
  - Build/produccion: `npm run build` y `npm start`.
  - Prisma: `npm run db:generate`, `npm run db:migrate`, `npm run db:push`.
- Base URL local sugerida: `http://localhost:3001/api`.

---

## 2. Frontend — `cotizador-automotriz`

### 2.1 Stack y data layer
- Next.js (App Router) + React 19.
- Redux Toolkit + RTK Query:
  - `src/app/api/api.ts` define `baseQuery` (usa `NEXT_PUBLIC_BASE_URL_API`, fallback `http://localhost:3003/api`) y tagTypes (`User`, `Company`, `Plan`, `HC`, `Vehicule`).
  - Endpoints inyectados por modulo (`authApi`, `companyApi`, `planApi`, `quotationApi`, `userApi`, `vehiculeApi`).
- Zustand:
  - `useAuthStore`: guarda `{ user, token, isAuthenticated, hydrated }` en localStorage (`auth-storage`), expone `setAuth`, `logout`, `updateUser`.
  - `createTableStore`: fabrica stores por tabla con filtros/paginacion/sort persistidos (`table-${id}`) y toggle de filtros desktop.
- Formularios: `react-hook-form` + `zod`.
- PDFs: `pdfmake` (`src/app/utils/generateQuotationPdf.ts`).
- Estilos: `globals.css`, componentes UI propios y fuentes Poppins en `public/fonts`.

### 2.2 Estructura relevante
- `src/app/layout.tsx`: monta `ReduxProvider`.
- `src/app/hooks/useAuthRedirect.ts`: proteccion de rutas por rol.
- `src/app/components`: `NavDashboard` (barra superior responsive), `WindowFormButton` (abre CRUD en popup), `customTable` (tabla reutilizable con filtros/paginacion/orden y soporte mobile), inputs/selects reutilizables.
- `src/app/store`: `store.ts` (configureStore + api.middleware), providers y stores Zustand.
- `src/app/dashboard/*`: vistas listadas por rol; `/(CRUDS OUT WINDOWS)` alberga formularios/ventanas para CRUDs y simulador.
- Tipos en `src/app/types/*` (plans, quotations, vehiculos, users, tablas).

### 2.3 Flujo de autenticacion y layout
- Login en `/` (email/password). Si ya hay sesion se redirige a `/dashboard`.
- `Header` + `NavDashboard` en `dashboard/layout.tsx`; navegacion por rol:
  - SUPER_ADMIN: Companias, Planes, Vehiculos, Administradores, Superadmins, Usuarios, Historial de cotizaciones.
  - ADMIN: Planes, Vehiculos, Usuarios, Historial de cotizaciones.
  - USER: Planes, Historial de cotizaciones y boton rapido para crear cotizacion.

### 2.4 Patrones reutilizables
- **Tablas** (`customTable.tsx`):
  - Usa `createTableStore` para persistir filtros/paginacion/sort por id.
  - `FilterConfig` soporta texto, select, multiselect, selectSearch (con loaders asincronos), fechas y numeros.
  - Acciones comunes con `TableActions` (ver/editar/eliminar/PDF) y paginacion desktop/mobile.
- **RTK Query**:
  - Queries usan `URLSearchParams` para paginacion/filtros (ej. `planApi`, `vehiculeApi`).
  - Tags por entidad; ventanas popup publican `postMessage` y se invalidan caches con `util.invalidateTags`.
- **Ventanas/popup** (`WindowFormButton`):
  - CRUDs y simulador se abren en nueva ventana; al guardar emiten `postMessage` para actualizar tablas sin recargar.

### 2.5 Vistas y modulos
- **Planes** (`/dashboard/planes`):
  - Tabla con filtros, version vigente y coeficientes (quebranto, cuota balon y meses).
  - Edicion crea nueva `PlanVersion` automaticamente.
  - Formularios permiten logo y rangos `desde/hasta`.
- **Vehiculos** (`/dashboard/vehiculos`):
  - CRUD de marcas/lineas/versiones asociadas a companias.
  - Filtros por compania/marca/linea; admin solo ve sus companias.
  - Form permite usar marca/linea existentes o crear nuevas en una sola transaccion.
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

### 2.6 Configuracion y scripts
- `.env.example`: `NEXT_PUBLIC_BASE_URL_API` (API REST) y `NEXT_PUBLIC_BASE_URL_IMG` (ruta a `/uploads` del backend).
- Ajustar `NEXT_PUBLIC_BASE_URL_API` si el backend no corre en `3001`; el fallback de `baseQuery` es `http://localhost:3003/api`.
- Scripts desde `cotizador-automotriz`:
  - Desarrollo: `npm run dev`.
  - Lint: `npm run lint`.
  - Build/produccion: `npm run build` y `npm start`.

---

## 3. Relacion con el Excel
- El simulador replica la logica de coeficientes de la hoja `COEFICIENTES` del Excel y calcula cuotas como `coeficiente / 10000 * monto`, quebranto financiero y cuotas balon.
- Se importo el set de planes/coeficientes y usuarios de ejemplo mediante la migracion `20251120170000_seed_excel_plans`.
- La hoja de Leasing sigue pendiente de implementacion como tipo de plan especializado (ver notas en `AGENTS.md`).
