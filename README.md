# Creator Library Project

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-teal?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-DB-003B57?logo=sqlite)](https://www.sqlite.org/index.html)
[![Zod](https://img.shields.io/badge/Zod-Validation-blueviolet)](https://zod.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Heroicons](https://img.shields.io/badge/Heroicons-UI-000000)](https://heroicons.com/)
[![Prettier](https://img.shields.io/badge/Prettier-Code_Formatter-F7B93B?logo=prettier)](https://prettier.io/)

Este proyecto es una aplicación web para gestionar una biblioteca de activos digitales, construida con **Next.js 15 (App Router)** y **TypeScript**. La solución se enfoca en el rendimiento y la seguridad, utilizando **Server Components** y **Server Actions** para manejar la lógica de datos y permisos directamente en el servidor.

-----

### Demo y Recursos Adicionales

  * **Ver la demo:** Puedes ver la aplicación en vivo en [Demo Vercel](https://creator-library.vercel.app/).
  * **Video del proyecto:** Un breve recorrido por la aplicación está disponible en [Video Jam](https://jam.dev/c/ef4772b8-dafe-4ea9-973c-dcaf0261c709).
  * **Seguimiento de features:** El estado de las funcionalidades del proyecto (activos, en desarrollo, o deprecadas) se puede seguir en [Historial de Features](https://www.notion.so/vibepeak-26957f00378f80bb9366fe0a7b665330?source=copy_link).

-----

## Cómo ejecutar el proyecto localmente

Sigue estos pasos para levantar la aplicación en tu máquina.

### 1\. Clonar el repositorio

Abre tu terminal y ejecuta el siguiente comando para clonar el repositorio del proyecto y overte al proyecto.

```bash
git clone https://github.com/alejeindrox/creator-library
cd <NOMBRE_DE_TU_CARPETA> # Por defecto es creator-library
```

### 2\. Instalación de dependencias

Abre tu terminal en la carpeta del proyecto y ejecuta tu gestor de paquetes preferido.

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3\. Configuración del entorno

Antes de instalar las dependencias, copia el archivo de ejemplo de las variables de entorno para que tu aplicación pueda acceder a las configuraciones necesarias, como la URL de la base de datos.

```bash
cp .env.example .env
```

### 4\. Configuración y migración de la base de datos

El proyecto utiliza **Prisma** con **SQLite**. Para configurar la base de datos y agregar algunos datos iniciales, ejecuta los siguientes scripts:

```bash
npm run db:migrate
npm run db:seed
```

El primer comando migra el esquema de la base de datos, y el segundo la puebla con usuarios de prueba y algunos assets de ejemplo.

### 5\. Iniciar el servidor de desarrollo

Ya estás listo para correr la aplicación.

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost.com:3000).

-----

## Estructura y Arquitectura

La aplicación sigue la **Arquitectura Hexagonal**, un enfoque que separa la lógica de negocio del lado del servidor (el "núcleo") de la tecnología externa (como la base de datos).

### Capa de Aplicación y Dominio

  * **Autenticación:**
      * **Login:** El formulario de login valida que el email no esté vacío y tenga un formato de email válido.
      * **Usuarios de prueba:** Para acceder, puedes usar los siguientes correos electrónicos: `basic@test.com` y `pro@test.com`.
  * **Gestión de assets:**
      * **Crear Asset:** El formulario valida que el título y la URL no estén vacíos. Además, verifica que la URL sea un enlace válido, que efectivamente apunte a una imagen, y que la petición no tarde más de 5 segundos en el servidor.
      * **Favoritos:** La acción de marcar como favorito verifica la existencia del usuario en el servidor antes de proceder.
  * **Manejo de planes:** La acción para cambiar el plan del usuario también verifica la existencia del usuario en el servidor antes de realizar cualquier actualización.

### Capa de UI y Renderizado

La aplicación consta de 21 componentes:

  * **11 Server Components:** Utilizados para el `data-fetching` inicial y la renderización de páginas. Esto reduce la carga del cliente y mejora el SEO y el rendimiento.
  * **10 Client Components:** Utilizados para la interactividad del usuario y el manejo de estado, como la gestión de formularios.

Este enfoque mixto optimiza el rendimiento y la experiencia de usuario, ya que solo el código de interfaz necesario se envía al cliente.

-----

## Rutas y Acceso

### Protección de Rutas con Middleware

La seguridad en la navegación se gestiona con el **middleware de Next.js**. Este se encarga de:

* **Proteger rutas privadas:** Evita que usuarios no autenticados accedan a rutas como `/library` o `/upgrade`.
* **Redirigir a usuarios autenticados:** Si un usuario ya ha iniciado sesión e intenta ir a la página `/login`, el middleware lo redirige automáticamente a `/library`, mejorando la experiencia de usuario.

### Rutas de la Aplicación

La aplicación tiene las siguientes rutas principales:

  * `/`: Página de inicio.
  * `/login`: Página de autenticación. Solo es accesible para usuarios no autenticados.
  * `/library`: La biblioteca de assets. Esta ruta está protegida y solo es accesible para usuarios autenticados.
  * `/upgrade`: Página para actualizar el plan. Esta ruta también está protegida.

-----

## Enfoque técnico y decisiones clave

### Coherencia de datos

Para garantizar que la interfaz de usuario se mantenga actualizada después de cada acción (crear un activo, marcar un favorito, etc.), utilizo el sistema de **caché de datos de Next.js**.

En lugar de deshabilitar la caché o refrescar la página manualmente, las **Server Actions** invalidan de forma selectiva la caché de la ruta con la función `revalidatePath()`. Por ejemplo, al crear un nuevo asset, el comando `revalidatePath('/library')` se ejecuta para asegurar que la página de la biblioteca muestre los datos más recientes la próxima vez que se solicite. Esto nos permite mantener una experiencia de usuario fluida y una alta eficiencia de caché.

### Permisos y seguridad en el servidor

La seguridad y los permisos se gestionan exclusivamente en el servidor.

  * **Autenticación:** La sesión del usuario se gestiona a través de una cookie. La función `getSessionUser()` verifica la sesión en el servidor y, si el usuario no está autenticado, se le redirige automáticamente a la página de inicio de sesión (`/login`).
  * **Autorización:** Las Server Actions aplican las reglas de negocio. Por ejemplo, en `createAssetAction`, verifico el plan del usuario antes de permitir la creación de un nuevo asset. Si el usuario `basic` intenta crear más de 5 assets, se le redirige a la página `/upgrade`, impidiendo que la acción se complete.
  * **Mutaciones seguras:** Todas las operaciones de modificación de datos se ejecutan en el servidor a través de Server Actions. Esto asegura que la lógica de validación y negocio se ejecute en un entorno seguro y de confianza, lejos del cliente.

-----

### Limitaciones y reflexiones

* **Diseño:** La interfaz de usuario es funcional pero básica, enfocada en cumplir los requisitos del desafío más que en un diseño visual pulido.
* **Manejo de errores:** Si bien los errores se muestran en los formularios, la aplicación no cuenta con un sistema de notificaciones globales (como toasts o pop-ups) para informar al usuario sobre éxitos o fallos en toda la aplicación.
* **Autenticación avanzada:** La gestión de sesiones es simple, basada en cookies, y no incluye características de seguridad más avanzadas como la rotación de tokens o el uso de JWTs.

He tomado la decisión de aplicar los principios **SOLID** en la lógica de negocio, por ejemplo, al separar la validación, la autenticación y la lógica del plan en funciones distintas. Este enfoque garantiza que el código sea modular y más fácil de mantener a largo plazo, incluso si por ahora la aplicación es pequeña.
