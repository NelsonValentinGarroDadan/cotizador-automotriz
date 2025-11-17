# Cotizador Automotriz (API + Frontend)

Repositorio monorepo para un simulador de créditos automotrices basado en un Excel de referencia.
Incluye:

- `cotizador-api`: backend REST en Express + TypeScript + Prisma (MySQL).
- `cotizador-automotriz`: frontend en Next.js + React (App Router) con Redux Toolkit.

---

## 1. Backend – `cotizador-api`

### 1.1. Stack y dependencias principales

- Node.js + TypeScript (`ts-node-dev` en dev, `tsc` en build).
- Express 5.
- Prisma ORM (`@prisma/client`, `prisma`) contra MySQL.
- Autenticación: JWT (`jsonwebtoken`).
- Utilidades:
  - `cors` (CORS).
  - `morgan` (logging HTTP).
  - `multer` + `sharp` (subida y procesamiento de logos).
  - `zod` (validación de entrada).
  - `bcrypt`/`bcryptjs` (hashing de password).

### 1.2. Roles y permisos

Enum `Role` (compartido entre Prisma y el código):

- `SUPER_ADMIN`
  - Ve todas las compañías, planes, usuarios y cotizaciones (sin límite por compañía).
  - Puede crear, editar y eliminar cualquier entidad.
  - Es el único que puede crear otros usuarios con rol `SUPER_ADMIN`.
- `ADMIN`
  - Ve y gestiona:
    - Compañías donde está asociado (`user_companies`).
    - Planes y cotizaciones de esas compañías.
    - Usuarios (según reglas de negocio).
- `USER`
  - Ve solo:
    - Compañías asignadas.
    - Planes permitidos (`allowedPlans`).
    - Sus propias cotizaciones.

En rutas sensibles (`/users`, `/companies`, `/plans`, `/quotations`) se usa:

- `authMiddleware` → exige JWT y setea `req.user`.
- `authorizeRole` → restringe ciertos endpoints a `ADMIN` y/o `SUPER_ADMIN`.
- Validaciones extra en servicios:
  - `SUPER_ADMIN` salta los checks de pertenencia a compañía.
  - `ADMIN`/`USER` mantienen las validaciones originales.

### 1.3. Estructura de carpetas

`cotizador-api/src`:

- `app.ts`
  - Inicializa Express.
  - Carga `.env`.
  - Configura middlewares:
    - `cors()`
    - `express.json()`
    - `morgan("dev")`
    - Router principal en `/api`.
    - `errorHandler` global.
    - `express.static` para `/uploads`.
- `server.ts`
  - Levanta el servidor en `PORT` (`3001` por defecto).
- `config/prisma.ts`
  - Inicializa Prisma Client.
- `routes/route.ts`
  - Router raíz montado en `/api`:
    - `/auth` (login).
    - Resto de rutas protegidas con `authMiddleware`:
      - `/users`
      - `/companies`
      - `/plans`
      - `/quotations`

- `core/errors`
  - `appError.ts`: clase `AppError` (errores de negocio con `statusCode`).
  - `errorHandler.ts`: middleware global de errores.

- `core/middleware`
  - `authMiddleware.ts`: valida JWT y agrega `req.user`.
  - `authorizeRole.ts`: restringe rutas por rol.
  - `uploadLogo.ts`: configuración de `multer` + `sharp` para logos.
  - `validateRequest.ts`: ejecuta esquemas `zod` y normaliza campos JSON (`companyIds`, `coefficients`, `allowedUserIds`).

- `modules`
  - `auth`:
    - Login con email/password, devuelve `{ token, user }`.
  - `users`:
    - CRUD de usuarios.
    - `createUser`:
      - Solo un `SUPER_ADMIN` puede crear otro `SUPER_ADMIN` (validado en el controller).
    - Soporta asignar compañías y planes permitidos (`allowedPlanIds`).
  - `companies`:
    - CRUD de compañías.
    - Cuando se crea, se vincula automáticamente la relación `user_companies` con el creador.
    - Visibilidad:
      - `SUPER_ADMIN`: ve todas.
      - `ADMIN`/`USER`: solo compañías donde están en `user_companies`.
  - `plans`:
    - Modelos:
      - `Plan`, `PlanVersion`, `PlanCoefficient`, `CuotaBalonMonth`.
    - `PlanVersion`:
      - Soporta límites de uso:
        - `desdeMonto`, `hastaMonto`.
        - `desdeCuota`, `hastaCuota`.
    - `PlanCoefficient`:
      - `plazo`, `tna`, `coeficiente`, `quebrantoFinanciero`,
        `cuotaBalon`, `cuotaPromedio`, `cuotaBalonMonths`.
    - Lógica:
      - Crea primera versión al crear un plan.
      - Al actualizar con nuevos coeficientes, genera nueva versión y marca las anteriores como `isLatest = false`.
    - Visibilidad:
      - `SUPER_ADMIN`: todos los planes.
      - `ADMIN`: planes de sus compañías.
      - `USER`: solo planes en `allowedUsers`.
  - `qoutation` (módulo de cotizaciones):
    - Rutas en `/api/quotations`.
    - Crea cotizaciones ligadas a:
      - `planVersion`
      - `company`
      - `user` (creador)
    - Visibilidad:
      - `SUPER_ADMIN`: todas las cotizaciones.
      - `ADMIN`: cotizaciones de sus compañías.
      - `USER`: solo sus propias cotizaciones.

### 1.4. Configuración y entorno

1. Crear `.env` en `cotizador-api` (basado en `.env.example`):

   ```env
   DATABASE_URL="mysql://user:password@host:port/dbname"
   JWT_SECRET="alguna_clave_segura"
   PORT=3001
   ```

2. Instalar dependencias:

   ```bash
   cd cotizador-api
   npm install
   ```

3. Prisma:

   ```bash
   npm run db:generate
   npm run db:migrate
   # o
   npm run db:push
   ```

### 1.5. Scripts

- Desarrollo:

  ```bash
  npm run dev
  npm run dev:migrate
  ```

- Producción:

  ```bash
  npm run build
  npm start
  ```

---

## 2. Frontend – `cotizador-automotriz`

### 2.1. Stack

- Next.js 16 (App Router).
- React 19.
- Redux Toolkit + RTK Query.
- `react-hook-form` + `zod` para formularios.
- `zustand` para auth y estado auxiliar.
- `pdfmake` para generación de PDFs de cotización.

### 2.2. Estructura principal

`cotizador-automotriz/src/app`:

- `layout.tsx`
  - Layout global.
  - Usa `ReduxProvider`.
- `page.tsx`
  - Home del simulador.
- `dashboard/layout.tsx`
  - Layout del dashboard (barra lateral + contenido).
  - Navegación según rol:
    - `SUPER_ADMIN`:
      - Compañías, Planes, Administradores, Superadmins, Usuarios, Historial de cotizaciones.
    - `ADMIN`:
      - Compañías, Planes, Administradores, Usuarios, Historial de cotizaciones.
    - `USER`:
      - Compañías, Planes, Historial de cotizaciones, acción “Crear cotización”.
- `components/navDashboard.tsx`
  - Renderiza el menú lateral.
  - Incluye botón “Cerrar sesión” que:
    - Limpia `useAuthStore` (`logout()`).
    - Redirige a `/`.

- `store/useAuthStore.ts`
  - Maneja `user`, `token` e `isAuthenticated` con `zustand` + `persist`.
- `hooks/useAuthRedirect.ts`
  - Redirige al login si no hay usuario.
  - Permite pasar roles permitidos, por ejemplo:
    - `useAuthRedirect([Role.SUPER_ADMIN])` para vistas solo de superadmin.

### 2.3. Secciones del dashboard

- `dashboard` (Compañías):
  - Listado filtrable y paginado de compañías.
  - CRUD vía ventanas modales (rutas `/(CRUDS OUT WINDOWS)/companies`).

- `dashboard/planes`:
  - Listado de planes con sus versiones.
  - CRUD de planes y coeficientes:
    - Coeficiente = valor que se multiplica por el monto (`coeficiente / 10000`) para obtener la cuota base.
    - Soporta quebranto financiero, cuota balón y meses de cuota balón.

- `dashboard/administradores`:
  - Gestión de administradores (usuarios con rol `ADMIN`).
  - Acceso:
    - `ADMIN` y `SUPER_ADMIN`.
  - Usa:
    - `userApi` para listar usuarios filtrando `role=ADMIN`.
    - Ventanas `/(CRUDS OUT WINDOWS)/administradores` para alta/edición.

- `dashboard/superadmins`:
  - **Nueva vista** exclusiva de `SUPER_ADMIN`.
  - Lista solo usuarios con rol `SUPER_ADMIN` (via `role=SUPER_ADMIN` en `userApi`).
  - Usa el mismo formulario que administradores, pero:
    - Cuando se abre con `?superadmin=true`, el formulario crea por defecto un usuario `SUPER_ADMIN`.
    - Al editar, mantiene el rol actual.
  - El backend valida que solo un `SUPER_ADMIN` puede crear otro `SUPER_ADMIN`.

- `dashboard/usuarios`:
  - Gestión de usuarios de rol `USER`.

- `dashboard/historial-cotizaciones`:
  - Listado de cotizaciones con filtros.
  - Permite abrir la cotización (ver/editar), generar PDF, etc.

### 2.4. Simulador de cotizaciones (HC)

- Ruta: `/(CRUDS OUT WINDOWS)/HC/…`
- `HCForm.tsx`:
  - Seleccionás:
    - Compañía.
    - Monto a financiar.
  - La tabla de “Planes Disponibles”:
    - Filas: planes.
    - Columnas: plazos (`plazo` en meses).
    - Cada celda:
      - TNA (`tna` redondeada hacia arriba).
      - Cuota calculada:
        - `cuota = monto * (coeficiente / 10000)`.
      - Quebranto:
        - `quebranto = ceil(monto * (quebrantoFinanciero / 100) * 1.21)`.
      - Cuota balón:
        - Monto y meses (`cuotaBalon`, `cuotaBalonMonths`).
    - Aplica restricciones de `PlanVersion`:
      - Si el monto está fuera de `[desdeMonto, hastaMonto]`:
        - El plan no se puede seleccionar y aparecen guiones `-` en las celdas.
        - Se muestra un mensaje explicando el rango permitido.
      - Si el plazo está fuera de `[desdeCuota, hastaCuota]`:
        - Esa celda específica muestra `-` y un texto descriptivo en el plan.

- `utils/generateQuotationPdf.ts`:
  - Recalcula las mismas cuotas/valores para el PDF, para que coincidan con el simulador.

### 2.5. Scripts

Desde `cotizador-automotriz`:

- Desarrollo:

  ```bash
  npm run dev
  ```

- Producción:

  ```bash
  npm run build
  npm start
  ```

---

## 3. Relación con el Excel

- El Excel original tiene hojas:
  - `TABLAS`, `COEFICIENTES`, `CONSOLIDADO MAESTRO`, hojas por usuario y una hoja `Leasing`.
- El sistema ya replica:
  - Estructura de coeficientes y TNA (hoja `COEFICIENTES`).
  - Cálculo de cuotas a partir de `coeficiente / 10000 * monto`.
  - Quebranto financiero (porcentaje + IVA).
  - Cuotas balón (monto y meses).
  - Restricciones de uso por monto y plazo (`desdeMonto/hastaMonto`, `desdeCuota/hastaCuota`).
- Pendiente para llegar al 100%:
  - Implementar la lógica específica de la hoja **“Leasing”** (reglas propias de leasing) como tipo de plan especial o módulo dedicado.

