# Full‑Stack Challenge (1.5–2.5 h) — Next.js 15 + TypeScript + SQLite

**Nombre del reto:** _Creator Library — Lite_  
**Tiempo estimado:** 1.5–2.5 horas (entregas parciales justificadas son bienvenidas)

## Objetivo

Evaluar tu capacidad para construir una pequeña funcionalidad con **Next.js 15 (App Router)**, **TypeScript** y **SQLite**, priorizando:

- Renderizado en servidor cuando sea apropiado.
- Mutaciones seguras desde el servidor.
- Coherencia de datos tras crear/editar.
- Permisos aplicados en el servidor (no en el cliente).

> **Ejecución local**: Entorno Node (no Edge). Persistencia con **SQLite** en archivo. No se requieren servicios externos.

---

## Dominio (simplificado)

**users**: `id`, `email (unique)`, `plan ('basic' | 'pro')`, `createdAt`  
**assets**: `id`, `userId`, `title`, `url`, `createdAt`  
**favorites**: `userId`, `assetId`, `createdAt` (único por `userId, assetId`)

**Semilla**: si la base no existe, crea 2 usuarios (uno `basic`, otro `pro`) y 2–3 `assets` de ejemplo (la propiedad `url` puede ser un enlace de placeholder).

---

## Lo que hay que construir

### 1) Acceso (login simple)

Un formulario de email que, al enviarse, establezca una **sesión** (por cookie) para identificar al usuario en el **servidor**.  
_No usar localStorage ni pasar el identificador desde el navegador._

### 2) Biblioteca

Página **`/library`** que muestra la lista de `assets` relevantes para el usuario actual.  
El **data‑fetching** debe ocurrir en el **servidor**. Evita soluciones que desactiven la caché global sin necesidad. Explica tu enfoque.

### 3) Crear asset

Un formulario con `title` y `url` que **cree** un asset para el usuario activo.  
Requisitos:

- Validación (campos vacíos / formato de URL razonable).
- La lista debe reflejar el nuevo registro sin refresco manual.
- Los errores deben mostrarse de forma comprensible.

### 4) Favoritos (toggle)

Permite **marcar / desmarcar** como favorito un asset. El estado debe persistir y verse actualizado tras la acción.

### 5) Límite por plan

Los usuarios **basic** pueden **crear hasta 5 assets**.  
Al intentar crear el 6.º, redirige a una página **`/upgrade`** con un botón “**Upgrade to Pro**” que actualiza el plan en el **servidor** y vuelve a `/library`.

### 6) Estados y mensajes

Añade estados de carga y error donde aplique; evita fallos silenciosos.

---

## Entregables

- Repositorio con **README** que explique:
  - Cómo ejecutar el proyecto localmente (instalar, migrar/seed, levantar).
  - Tu **enfoque de consistencia** de datos tras mutaciones (qué cacheas y cómo lo invalidas o sincronizas).
  - Cómo aplicas **permisos en el servidor**.
  - Decisiones y limitaciones principales.

- Incluir el archivo de **SQLite** o un seed que lo genere al vuelo.
- (Opcional) Un breve vídeo (<=3 min) recorriendo el flujo.

---

## Criterios de evaluación (resumen)

- Uso razonado de renderizado en servidor y en cliente.
- Mutaciones realizadas desde el servidor con validación y mensajes claros.
- Coherencia de la UI tras crear/editar (sin “trucos” que desactiven la caché por completo).
- Permisos verificados en el **servidor**.
- Claridad del README y simplicidad de la solución.

> No se evalúa el diseño visual “pixel perfect”. Valoramos la claridad, los fundamentos y la coherencia de la solución.
