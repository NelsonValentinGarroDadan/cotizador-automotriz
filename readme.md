 # Cotizador Automotriz (API + Frontend)

  Repositorio monorepo para un simulador de créditos automotrices basado en un Excel de referencia.
  Incluye:

  - cotizador-api: backend REST en Express + TypeScript + Prisma (MySQL).
  - cotizador-automotriz: frontend en Next.js + React (App Router) con Redux Toolkit.

  ———

  ## 1. Backend – cotizador-api

  ### 1.1. Stack y dependencias principales

  - Node.js + TypeScript (ts-node-dev en dev, tsc en build).
  - Express 5.
  - Prisma ORM (@prisma/client, prisma) contra MySQL.
  - Autenticación: JWT (jsonwebtoken).
  - Seguridad/utilidades:
      - cors (CORS).
      - morgan (logging HTTP).
      - multer + sharp (subida y procesamiento de logos).
      - zod (validación de entrada).
      - bcrypt/bcryptjs (hashing de password).

  ### 1.2. Estructura de carpetas

  cotizador-api/src:

  - app.ts
      - Inicializa Express.
      - Carga .env.
      - Configura middlewares globales:
          - cors()
          - express.json()
          - morgan("dev")
          - Router principal en /api.
          - errorHandler global.
          - express.static para /uploads.
  - server.ts
      - Levanta el servidor en PORT (3001 por defecto).
  - config/prisma.ts
      - Inicializa Prisma Client y conexión a la base.
  - routes/route.ts
      - Router raíz montado en /api:
          - /auth (login/registro).
          - Middleware authenticate (JWT) para el resto.
          - /users
          - /companies
          - /plans
          - /quotations
  - core/errors
      - appError.ts: clase AppError (errores de negocio con statusCode).
      - errorHandler.ts: middleware global de errores:
          - Si el error es AppError → responde con statusCode y { error: [message] }.
          - Si es desconocido → 500 + Internal Server Error.
  - core/middleware
      - authMiddleware.ts
          - Lee Authorization: Bearer <token>.
          - Verifica JWT (JWT_SECRET).
          - Adjunta req.user (tipo UserToken).
      - authorizeRole.ts
          - Middleware para restringir rutas por rol (ADMIN, USER).
      - uploadLogo.ts
          - Configura multer para subir archivos (logos).
          - Integra con sharp para procesar imágenes.
      - validateRequest.ts
          - Ejecuta esquemas zod sobre req.body/req.params/req.query.
          - En caso de error, lanza AppError con los mensajes de validación.
  - core/types
      - Tipos compartidos (ej: UserToken extendiendo el payload del JWT).
  - modules
      - auth
          - routes.ts: rutas de autenticación (/api/auth).
          - controller.ts, service.ts, repository.ts, schema.ts.
          - Lógica de login, hash de contraseña, emisión de JWT.
      - users
          - CRUD de usuarios; control de roles.
      - companies
          - CRUD de compañías.
          - Manejo de logos (subida a /uploads).
          - Relación usuario–compañía.
      - plans
          - Gestión de planes de financiación y sus versiones:
              - Plan, PlanVersion, PlanCoefficient.
          - schema.ts:
              - coefficientSchema: plazo, tna, coeficiente, quebrantoFinanciero, cuotaBalon,
                cuotaPromedio, cuotaBalonMonths.
              - createPlanSchema, createPlanVersionSchema, updatePlanWithVersionSchema.
          - service.ts:
              - Crea planes con su primera versión y coeficientes.
              - Crea nuevas versiones cuando cambian coeficientes.
              - Maneja campos de restricción: desdeMonto, hastaMonto, desdeCuota, hastaCuota.
          - repository.ts:
              - Acceso a BD con Prisma.
              - Incluye relaciones (companies, coefficients, etc.).
      - qoutation (módulo de cotizaciones)
          - routes.ts montado en /api/quotations.
          - schema.ts: definición de CreateQuotation y UpdateQuotation.
          - repository.ts:
              - getAllQuotations:
                  - Filtro por usuario vs. admin.
                  - Búsqueda por nombre/DNI, compañía, plan, fechas.
                  - Incluye:
                      - company (id, nombre, logo).
                      - user (nombre, email).
                      - planVersion con plan (nombre, logo).
              - getQuotationById:
                  - Incluye:
                      - company (y relación userCompanies para validar acceso).
                      - user.
                      - planVersion con:
                          - desdeMonto, hastaMonto, desdeCuota, hastaCuota.
                          - coefficients ordenados por plazo e incluyendo cuotaBalonMonths.
              - createQuotation:
                  - Crea la cotización ligada a planVersion, company, user.
              - updateQuotation, deleteQuotation.
  - utils
      - Funciones generales de apoyo (ej. paginación, helpers varios).
  - prisma
      - schema.prisma: modelos User, Company, UserCompany, Plan, PlanVersion, PlanCoefficient,
        CuotaBalonMonth, Quotation.
      - migrations/: migraciones generadas por Prisma.

  ### 1.3. Configuración y entorno

  1. Crear .env en cotizador-api (puedes usar .env.example como base):

     DATABASE_URL="mysql://user:password@host:port/dbname"
     JWT_SECRET="alguna_clave_segura"
     PORT=3001
  2. Instalar dependencias:

     cd cotizador-api
     npm install
  3. Generar Prisma Client y migrar BD:

     npm run db:generate
     npm run db:migrate
     # o npm run db:push para sincronizar esquema sin historial de migraciones

  ### 1.4. Scripts

  - Desarrollo:

    npm run dev       # levanta API en http://localhost:3001 (ts-node-dev)
    npm run dev:migrate  # migra BD y luego inicia dev
  - Producción:

    npm run build
    npm start         # ejecuta dist/server.js
  - Utilidades Prisma:

    npm run db:generate
    npm run db:migrate
    npm run db:push
    npm run db:studio

  ### 1.5. Flujo típico de uso de la API

  1. Autenticación
      - POST /api/auth/login
          - Devuelve JWT en caso de credenciales válidas.
      - El resto de rutas (users, companies, plans, quotations) requieren Authorization: Bearer
        <token>.
  2. Gestión de compañías
      - CRUD de compañías.
      - Subida de logo: endpoints que usan uploadLogo y guardan archivos en /uploads.
  3. Gestión de planes y coeficientes
      - Crear plan con:
          - companyIds.
          - Rango de aplicación (desdeMonto, hastaMonto, desdeCuota, hastaCuota).
          - Lista de coefficients (cada uno con plazo, tna, coeficiente, etc.).
      - Crear nuevas versiones de un plan cuando cambian coeficientes (versionado).
  4. Cotizaciones
      - Crear cotización (POST /api/quotations):
          - Campos: clientName, clientDni, vehicleData, totalValue, companyId, planId, planVersionId,
            plazo.
          - La lógica de cálculo de cuota se hace del lado del frontend, basado en los coeficientes
            asociados al planVersion.
      - Listar / buscar (GET /api/quotations):
          - Paginación, filtros por compañía, plan, fecha, etc.
      - Ver detalle (GET /api/quotations/:id):
          - Incluye el plan, coeficientes y meses de cuota balón.
      - Editar / eliminar (PUT, DELETE).

  ———

  ## 2. Frontend – cotizador-automotriz

  ### 2.1. Stack y dependencias principales

  - Next.js 16 (App Router, carpeta src/app).
  - React 19.
  - Redux Toolkit + RTK Query (@reduxjs/toolkit, react-redux).
  - Formularios:
      - react-hook-form
      - zod + @hookform/resolvers
  - Estado local adicional:
      - zustand
  - PDF:
      - pdfmake para generación de cotizaciones en PDF.

  ### 2.2. Estructura de carpetas

  cotizador-automotriz/src/app:

  - layout.tsx
      - Layout raíz de Next.js.
      - Importa globals.css.
      - Envuelve toda la app en ReduxProvider.
  - page.tsx
      - Página principal de la app (home / landing del simulador).
  - api/
      - Cliente de la API (RTK Query).
      - Ejemplos:
          - api/quotationApi.ts: endpoints /quotations (listar, obtener por id, crear, actualizar,
            eliminar).
          - api/planApi.ts: endpoints para planes y versiones.
          - api/companyApi.ts: endpoints para compañías.
          - api/authApi.ts: login, perfil, etc.
      - Cada archivo define injectEndpoints sobre un api base, con tags para invalidar cache.
  - store/
      - provider.tsx: ReduxProvider que envuelve la app.
      - Configuración de store:
          - Integración con RTK Query y otros slices.
      - En la app se usan hooks useAppDispatch, useAppSelector, etc.
  - components/
      - Componentes UI:
          - Inputs genéricos, botones (CustomButton), MultiSelect, tablas reutilizables, layout de
            dashboard, etc.
      - Están pensados para ser reutilizados por los distintos CRUDs y pantallas.
  - dashboard/
      - Pantallas dentro del dashboard principal.
      - Ejemplo:
          - dashboard/historial-cotizaciones/page.tsx:
              - Lista de cotizaciones (useGetAllQuotationsQuery).
              - Filtros (quotationFilters).
              - Tabla (quotationColumns).
              - Manejo de invalidación de cache al crear/editar/eliminar.
  - (CRUDS OUT WINDOWS)/
      - CRUDs que se abren en ventanas emergentes (popups) fuera del flujo principal de Next:
          - HC (Historial de Cotizaciones / alta-edición de cotizaciones):
              - components/HCForm.tsx:
                  - Formulario de creación/edición de cotización.
                  - Selección de compañía → filtra planes asociados.
                  - Input de monto → determina qué planes/plazos se muestran.
                  - Tabla de “Planes Disponibles”:
                      - Filas por plan.
                      - Columnas por plazo (número de cuotas).
                      - Para cada celda (plan + plazo):
                          - Usa los coeficientes de la API (PlanCoefficient).
                          - Calcula TNA y cuota:
                              - cuotaFinal = monto * (coeficiente / 10000).
                              - tnaMostrar = ceil(tna).
                              - quebranto = ceil(monto * (quebrantoFinanciero/100) * 1.21).
                              - Si el plan incluye “CHEQUES” en el nombre:
                                  - Muestra texto de cheques con cantidadCheques = plazo + 1.
                              - Si tiene cuota balón:
                                  - Muestra cuotaBalon y los meses (cuotaBalonMonths).
                      - Cuando el usuario selecciona un plan (radio), se guarda planId, planVersionId,
                        plazo y totalValue para enviar al backend.
              - Rutas auxiliares: view, edit, delete, pdf.
          - planes:
              - Formularios para creación/edición de planes y coeficientes.
              - Uso de PlanWithDetails, validaciones con zod (plan.ts).
              - Componente coefficientsManager.tsx para manejar lista de coeficientes (copiar último,
                editar TNA/coeficiente/quebranto/cuota balón).
  - utils/
      - generateQuotationPdf.ts:
          - Genera documento pdfMake para una cotización:
              - Usa quotation.totalValue y PlanCoefficient para recalcular cuotas, quebranto y cuota
                balón (misma lógica que en HCForm.tsx).
          - urlToBase64:
              - Convierte imágenes (logos) a base64 apto para pdfMake (con canvas).
  - types/
      - Modelos TypeScript que reflejan el backend:
          - plan.ts: Plan, PlanVersion, PlanCoefficient y esquemas zod para crear/editar planes.
          - quotition.ts (typo) u otros: tipos y validaciones para cotizaciones.
          - compay.ts, user.ts, etc.
  - hooks/
      - Hooks custom para lógica de UI y estado (por ejemplo, tablas, filtros, etc.).

  ### 2.3. Configuración y entorno

  1. Crear .env en cotizador-automotriz (basado en .env.example), por ejemplo:

     NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
  2. Instalar dependencias:

     cd cotizador-automotriz
     npm install

  ### 2.4. Scripts

  - Desarrollo:

    npm run dev        # Next dev server en http://localhost:3000
  - Producción:

    npm run build
    npm start          # Next start
  - Lint:

    npm run lint

  ### 2.5. Flujo típico de uso del frontend

  1. Iniciar backend y frontend:

     # Terminal 1
     cd cotizador-api
     npm run dev

     # Terminal 2
     cd cotizador-automotriz
     npm run dev
  2. Abrir http://localhost:3000 en el navegador.
  3. Autenticarse (login) para obtener un JWT que se guarda en el estado/almacenamiento del frontend.
  4. Navegar al dashboard:
      - Gestionar compañías y sus logos.
      - Crear planes y plan versions con coeficientes (modelo del Excel).
  5. Crear una cotización:
      - Seleccionar compañía.
      - Ingresar monto.
      - Evaluar planes/plazos disponibles en la tabla (las cuotas dependen de los coeficientes
        cargados).
      - Seleccionar el plan/plazo deseado.
      - Guardar → se envía cotización al backend.
  6. Exportar PDF:
      - Desde el historial o el detalle de la cotización, abrir la vista de PDF.
      - generateQuotationPdf arma el documento con los mismos cálculos que el Excel para TNA, cuotas y
        cuota balón.

  ———

  ## 3. Resumen de relación con el Excel

  - El backend modela las tablas del Excel (COEFICIENTES, planes y versiones) en la base de datos.
  - El frontend calcula cuotas usando exactamente la fórmula del Excel:
      - cuota = monto * (coeficiente / 10000), más quebranto y cuota balón cuando corresponda.
  - Las restricciones por monto/cuotas (desdeMonto, hastaMonto, desdeCuota, hastaCuota) están
    modeladas en el backend y expuestas al frontend, listas para usarse como filtros de elegibilidad
    de planes.