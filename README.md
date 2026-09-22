# EliteSport — Proyecto Final Programación 5

Aplicación web de gestión deportiva construida con PostgreSQL, Express.js y Next.js.

## Funcionalidades

- Autenticación con JWT.
- Tres roles diferenciados: Administrador, Entrenador y Deportista.
- Control de acceso por rol.
- Gestión de deportes (listar, crear, editar y eliminar).
- Gestión de deportistas y entrenadores desde el panel de administración.
- Gestión de equipos y asignación de deportistas.
- Programación de entrenamientos.
- Registro de asistencias.
- Gestión básica de torneos.
- Dashboard con estadísticas según el rol.
- Frontend Next.js consumiendo la API REST de Express.

## Estructura

```text
EliteSport_Completo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── scripts/
│   └── server.js
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── lib/api.js
├── database/
│   └── EliteSport_PostgreSQL.sql
├── COMO_EJECUTAR.md
└── .gitignore
```

## Credenciales demo

Administrador: `admin` / `Admin123!`

Entrenador: `entrenador` / `Entrenador123!`

Deportista: `deportista` / `Deportista123!`

Estas credenciales son solo para desarrollo local.
