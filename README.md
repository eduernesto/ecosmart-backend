# EcoSmart Bins — Backend

API REST que recibe mediciones de sensores ultrasónicos desde microcontroladores ESP32 (simulados en Wokwi) y las almacena en Supabase para su visualización en un dashboard web.

## Arquitectura

```
ESP32 (Wokwi)  ──POST──▶  Express API  ──▶  Supabase (PostgreSQL + Realtime)
    (simulado)              Render              │
                            (hosting)           ├── tachos (estado actual)
                                                └── historial_mediciones (serie temporal)
```

## Stack

| Capa        | Tecnología                          |
|-------------|-------------------------------------|
| Runtime     | Node.js                             |
| Framework   | Express 5                           |
| Base de datos | Supabase (PostgreSQL + Realtime) |
| Hosting     | Render (Free Tier)                  |
| WS transport| `ws` + `@supabase/supabase-js`      |

## Endpoints

| Método | Ruta                | Descripción                                      |
|--------|----------------------|--------------------------------------------------|
| GET    | `/`                  | Health check                                     |
| GET    | `/api/tachos`        | Lista todos los tachos con % ocupado             |
| GET    | `/api/tachos/llenos` | Solo tachos en estado `esta_lleno = true`        |
| GET    | `/api/tachos/stats`  | Resumen: total, llenos, disponibles              |
| POST   | `/api/mediciones`    | Recibe lecturas del ESP32 y actualiza Supabase   |

### POST `/api/mediciones` — Body esperado

```json
{
  "lecturas": [
    { "tacho_id": 1, "distancia": 89 },
    { "tacho_id": 2, "distancia": 12 }
  ]
}
```

## Instalación local

```bash
git clone https://github.com/tu-usuario/ecosmart-backend.git
cd ecosmart-backend
cp .env.example .env  # completa con tus credenciales
npm install
npm run dev           # nodemon con recarga automática
```

## Variables de entorno

| Variable        | Descripción                             |
|-----------------|-----------------------------------------|
| `PORT`          | Puerto del servidor (Render asigna uno) |
| `SUPABASE_URL`  | URL de tu proyecto Supabase             |
| `SUPABASE_KEY`  | Service Role Key de Supabase            |

## Esquema de base de datos

```sql
CREATE TABLE tachos (
  id            SERIAL PRIMARY KEY,
  nombre        TEXT,
  coordenada_x  NUMERIC,
  coordenada_y  NUMERIC,
  distancia_actual NUMERIC DEFAULT 120,
  esta_lleno    BOOLEAN DEFAULT FALSE,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE historial_mediciones (
  id         SERIAL PRIMARY KEY,
  tacho_id   INT REFERENCES tachos(id),
  distancia  NUMERIC,
  creado_en  TIMESTAMPTZ DEFAULT NOW()
);
```

## Deploy en Render

1. Conecta el repo a Render como **Web Service**
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Añade las variables de entorno en el dashboard de Render
