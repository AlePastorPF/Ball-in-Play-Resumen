# Rugby Performance Hub — Ball in Play 2025–2026

Web interactiva en **Next.js** con la **planilla Excel del repositorio GitHub como única fuente de datos**.

## Qué incluye

- Lectura desde `data/BiP_Full_25_26.xlsx` en GitHub, hoja `Datos consolidados`.
- Filtros múltiples por temporada, fecha, rival y resultado (Ctrl/Cmd + clic).
- Ball in Play por partido, máximo de secuencia, cantidad y tiempo total de secuencias >60 segundos, y porcentaje del BIP.
- Escudos de los clubes proporcionados.
- Ingreso protegido por contraseña; agregar, editar o eliminar **secuencias** (filas de Excel).
- Cada guardado actualiza el `.xlsx` mediante GitHub Contents API y genera un commit. Control de conflictos usando SHA; si cambió el Excel hay que recargar antes de editar.
- Vista local de solo lectura antes de configurar GitHub.

## Publicar en GitHub + Vercel

1. Creá un repositorio **privado** en GitHub (por ejemplo `rugby-performance-hub`).
2. Descomprimí el ZIP, subí **todos los archivos** de este proyecto al repositorio (incluye la carpeta `data/` con el Excel original).
3. En GitHub, creá un **fine-grained personal access token** restringido exclusivamente a este repositorio, permiso **Contents: Read and write**. Evitá tokens clásicos con acceso a todos los repositorios.
4. En [Vercel](https://vercel.com) seleccioná **Add New → Project → Import Git Repository** e importá el repositorio. Framework: Next.js (detectado automáticamente).
5. En **Settings → Environment Variables** agregá:

   | Variable | Valor |
   |---|---|
   | `GITHUB_OWNER` | usuario u organización que posee el repo |
   | `GITHUB_REPO` | nombre del repositorio |
   | `GITHUB_BRANCH` | `main` (o la rama elegida) |
   | `GITHUB_EXCEL_PATH` | `data/BiP_Full_25_26.xlsx` |
   | `GITHUB_TOKEN` | token restringido (solo servidor) |
   | `ADMIN_PASSWORD` | clave fuerte para editar desde la web |
   | `SESSION_SECRET` | cadena aleatoria de 32 o más caracteres |

6. Hacé **Deploy**. Si agregás las variables después de desplegar, ejecutá **Redeploy**.
7. Abrí la URL de Vercel: la web consulta el Excel real de GitHub. Para editar, usá **Administrador**.

### Actualizaciones

- **Desde la web:** cada cambio guardado escribe el Excel en GitHub y crea un commit. El panel recarga y actualiza los gráficos.
- **Desde Excel:** editá el archivo descargado y subí una nueva versión al **mismo path** de GitHub. Al pulsar «Actualizar» la web verá los cambios.
- **Cambiar código:** cualquier push a GitHub puede desplegar la nueva versión automáticamente mediante la integración de Vercel.

## Ejecutar localmente

Necesitás Node.js 20+:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Si no configuraste el token de GitHub, el dashboard muestra el Excel incluido en la carpeta `data/` en modo lectura. Una vez configuradas las variables podrás editar el archivo remoto.

## Seguridad y límites

- **No implementa OAuth/GitHub login de cada usuario**: tiene contraseña de administración compartida y sesión HTTP-only de 8 h. Recomendado como primer MVP para un solo club, no como sistema multiusuario definitivo.
- **NO almacenar tokens en componentes del navegador**. El token solo existe en variables del servidor.
- La aplicación **no debe publicarse mediante GitHub Pages como sitio estático**: las rutas API necesitan un backend (Vercel o servidor Next.js).
- Las lecturas son públicas para quien tenga acceso a la URL de la web, aunque el repositorio sea privado. Para datos internos del club, agregá control de acceso para lectura antes de compartir la URL.
- GitHub no es una base de datos: cada guardado crea un commit y puede disparar una nueva publicación de Vercel. Es apto para carga de datos de baja frecuencia, no edición simultánea intensiva.
- El importador conserva las 14 columnas originales; ExcelJS puede reescribir metadatos o formatos avanzados del XLSX. Mantené copias de respaldo y probá con una copia antes de usarlo en producción.
- **Un partido está compuesto por múltiples filas**. El editor cambia secuencias individuales. Para importar partidos completos de Catapult por CSV/XLSX hace falta un módulo adicional de carga masiva.
- Las fechas/jornadas con resultado de semifinal/final no se clasifican como victoria o derrota cuando el campo no lo indique expresamente.
- Fórmula `% BIP > 60 s = 100 × (Σ duración de secuencias estrictamente mayores a 60 s) / (Σ duración de todas las secuencias BIP del partido)`.
