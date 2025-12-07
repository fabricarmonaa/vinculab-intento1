# VincuLab Backend (Node.js nativo + CQRS)

## Arquitectura
- **HTTP nativo**: servidor en `backend/server.js` usando `node:http`.
- **CQRS**: carpetas `commands/` (mutaciones) y `queries/` (lecturas) separan flujos.
- **Repositorios**: encapsulan SQL en `repositories/` y actúan como fuente de verdad ACID.
- **Servicios OO**: `AuthService`, `SchoolRegistrationService`, `StudentVerificationService`, `ApplicationService`, `MailerService`, `TokenService` implementan las máquinas de estado y reglas.
- **Estado**:
  - `SchoolRegistration` PENDING→APPROVED/REJECTED con creación de usuario y contraseña temporal.
  - `StudentVerification` PENDING→APPROVED/REJECTED, única activa por estudiante, verificación se consulta en tabla.
  - `Application` SENT→REVIEWING/REJECTED→ACCEPTED/REJECTED.
- **Transacciones**: cambios de estado usan `withTransaction` (MySQL) para `COMMIT/ROLLBACK` automáticos.
- **JWT + Seguridad**: `TokenService` gestiona tokens; `middleware/auth.js` protege rutas.
- **Uploads**: `middleware/bodyParser.js` parsea multipart sin frameworks y guarda CV en `uploads/cvs`.

## Endpoints clave (mantienen rutas del frontend)
- `POST /api/v1/auth/register`, `POST /auth/login`, `GET|PUT /auth/me`, `POST /auth/upload-cv`.
- `GET /schools`.
- Verificaciones: `POST /verifications`, `GET /verifications/me`, `GET /verifications/school/pending`, `GET /verifications/school/approved`, `POST /verifications/:id/decide`.
- Ofertas: `GET /offers`, `GET /offers/:id`, `GET /offers/company`, `POST /offers`, `PUT /offers/:id`, `DELETE /offers/:id`.
- Postulaciones: `POST /applications`, `GET /applications/me`, `POST /applications/:id/cancel`, `PUT /applications/:id/decision`, `GET /offers/:id/applications`.

## Base de datos (4FN)
Esquema en `schema.sql` mantiene cada hecho en una sola tabla:
- `users` mantiene credenciales/rol sin flags duplicados.
- `school_registrations` separa la solicitud inicial (estado PENDING/APPROVED/REJECTED) de `schools` aprobadas.
- `schools`, `students`, `companies` normalizan datos específicos por rol sin multivalores.
- `verifications` almacena verificación de estudiante (fuente única del estado verificado).
- `offers` y `applications` separan publicaciones de postulaciones y sus estados.
Cada tabla depende solo de su clave primaria, sin dependencias multivaluadas, cumpliendo 4FN.

## Configuración
Variables en `.env` (ver `config/env.js`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=vinculab
JWT_SECRET=super-secret-demo-key
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=user
MAIL_PASS=pass
MAIL_FROM=no-reply@vinculab.local
```
Levantar servidor:
```
node backend/server.js
```
