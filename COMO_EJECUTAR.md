# Cómo ejecutar EliteSport en Windows + PowerShell

## 1. PostgreSQL

Crea la base de datos `elitesport` y ejecuta `database/EliteSport_PostgreSQL.sql`.

> El script recrea el esquema `elitesport` con `DROP SCHEMA ... CASCADE`. Haz una copia si ya tienes datos que quieras conservar.

## 2. Backend

Abre una terminal en `backend`.

```powershell
npm.cmd install
Copy-Item .env.example .env
```

Edita `.env` y coloca la contraseña real de tu usuario de PostgreSQL.

Ejemplo:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elitesport
DB_USER=postgres
DB_PASSWORD=TU_CONTRASENA_REAL
JWT_SECRET=EliteSport_Clave_Local_2026_Cambiar
FRONTEND_URL=http://localhost:3000
```

Crea los datos demo:

```powershell
npm.cmd run seed
```

Inicia el backend:

```powershell
npm.cmd run dev
```

API: `http://localhost:4000`

Comprobación: `http://localhost:4000/api/health`

## 3. Frontend

Abre otra terminal en `frontend`.

```powershell
npm.cmd install
Copy-Item .env.local.example .env.local
npm.cmd run dev
```

Frontend: `http://localhost:3000`

## 4. Prueba

1. Abre `http://localhost:3000`.
2. Pulsa **Iniciar sesión**.
3. Prueba los tres usuarios demo.
4. Verifica que cada rol muestra funciones diferentes.
5. Como administrador, prueba crear, editar y eliminar un deporte; crear deportistas y entrenadores; y crear torneos.
6. Como entrenador, prueba crear un equipo, programar un entrenamiento y registrar asistencia.
7. Como deportista, consulta equipos, entrenamientos y torneos.

## 5. PowerShell y npm

Si PowerShell bloquea `npm.ps1`, usa `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

No subas `.env`, `.env.local`, `node_modules` ni `.next` a GitHub.
