# Documento Técnico: Sistema Automatizado DevOps - Calculadora de Promedio Ponderado

## 1. Introducción
Este documento describe la implementación de un sistema automatizado DevOps para la aplicación "Calculadora de Promedio Ponderado". El objetivo es integrar desarrollo e infraestructura cloud mediante prácticas CI/CD, contenedores y despliegue automatizado, eliminando tareas manuales repetitivas y reduciendo errores humanos en la entrega continua de software.

## 2. Arquitectura
Componentes principales:
- Repositorio de código: GitHub (control de versiones, ramas y GitHub Actions).
- CI/CD: GitHub Actions (validación, pruebas y despliegue).
- Contenerización: Docker (imagen basada en Node.js v18-alpine).
- Orquestación y ejecución: Docker/Docker Compose en instancia AWS EC2 (Ubuntu 24.04 LTS).

Flujo del código (texto plano):
git push ➔ GitHub (push/PR) ➔ GitHub Actions (Checkout ➔ Setup Node ➔ Lint ➔ Test ➔ Build Docker image) ➔ SSH deploy hacia EC2 ➔ Docker stop/rm ➔ Docker run / docker-compose up ➔ App expuesta en puerto 80

## 3. Docker y Explicación del Dockerfile
Ejemplo de `Dockerfile` estándar para Node.js v18-alpine:

```Dockerfile
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar solo package.json y package-lock.json para aprovechar cache de capas
COPY package*.json ./

# Instalar dependencias (no se copian fuentes aún)
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Compilar / construir si aplica
RUN npm run build || true

# Puerto interno de la aplicación
EXPOSE 3000

# Comando por defecto
CMD ["node", "app.js"]
```

Razonamiento breve:
- Se usa la imagen `alpine` por su tamaño reducido y menor superficie de ataque, lo que mejora tiempos de transferencia y seguridad.
- Separar la copia de `package*.json` y ejecutar `npm ci` permite aprovechar la caché de capas de Docker: cambios en el código no invalidan la capa de dependencias, acelerando builds incrementales.

## 4. Pipeline y Explicación del CI/CD
Pasos del pipeline (resumen):
- Checkout: obtener código y referencias de commit/branch.
- Setup Node: instalar Node.js v18 en el runner.
- Dependencias: `npm ci` para reproducibilidad.
- Calidad: ejecutar `npx eslint .` y aplicar formato con `prettier --check`.
- Tests: ejecutar `npm test` (Jest).
- Build: construir la imagen Docker y taguearla (`ghcr` o image registry).
- Despliegue: conexión SSH al servidor EC2 y ejecución del script de despliegue.

Snippet de despliegue SSH (explicación y ejemplo):

```bash
#!/bin/bash
set -e

# Variables: REPO, BRANCH, APP_DIR, IMAGE_TAG
REPO="git@github.com:usuario/repo.git"
BRANCH="${GITHUB_REF##*/}"
APP_DIR="/home/ubuntu/app"

# Detener y eliminar contenedor anterior (no producir error si no existe)
docker stop calc_app || true
docker rm calc_app || true

# Clonado dinámico o actualización del repo en destino
if [ ! -d "$APP_DIR" ]; then
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
else
  cd "$APP_DIR" && git fetch origin && git checkout "$BRANCH" && git pull
fi

cd "$APP_DIR"

# Construir la imagen y ejecutar (o usar docker-compose)
docker build -t calc_app:${GITHUB_SHA::7} .
docker run -d --name calc_app -p 80:3000 --restart=always calc_app:${GITHUB_SHA::7}
```

Justificaciones:
- `set -e`: termina la ejecución si cualquier comando falla, evitando estados parciales y despliegues inconsistentes.
- `docker stop/rm || true`: asegura que el script no falle si no existe un contenedor previo; permite un reemplazo limpio.
- Clonado dinámico con variables: facilita despliegue desde ramas o tags específicos sin hardcodear referencias.
- Mapeo `-p 80:3000`: expone el puerto público 80 en la instancia y mantiene el puerto interno 3000 en el contenedor.

## 5. AWS e Infraestructura Cloud
Configuración recomendada para la instancia EC2 (Ubuntu Server 24.04 LTS):
- Tipo de instancia: t3.micro/t3.small (según carga esperada).
- Usuario por defecto: `ubuntu`.
- Sistema operativo: Ubuntu 24.04 LTS con Docker Engine instalado.
- Usuarios y permisos Docker:
  - Instalar Docker y docker-compose.
  - Agregar `ubuntu` al grupo `docker` para evitar uso constante de `sudo`:
    - `sudo usermod -aG docker ubuntu` y reiniciar sesión.
- Seguridad (Security Group):
  - Puerto 22 (SSH): permitir sólo desde las IPs del runner o rango de GitHub Actions (idealmente usar bastión o GitHub Actions self-hosted runners); para pipelines se recomienda crear una llave SSH y almacenarla en `GitHub Secrets`.
  - Puerto 80 (HTTP): permitir acceso global (0.0.0.0/0) para tráfico web público.
  - (Opcional) Puerto 443 (HTTPS): si se habilita TLS.
- Autenticación y despliegue:
  - Registrar la clave pública SSH de GitHub Actions (o del secreto) en `/home/ubuntu/.ssh/authorized_keys`.
  - Guardar en GitHub Secrets: `EC2_SSH_KEY`, `EC2_USER`, `EC2_HOST`, `REPO`, `BRANCH`.
- Persistencia y logs:
  - Volúmenes Docker o bind mounts para persistencia si la app requiere datos.
  - Configurar rotación de logs y monitoreo básico (CloudWatch o agente de logs).

## 6. Evidencias de Funcionamiento
- 6.1 Pipeline Exitoso en GitHub Actions — [captura placeholder]
- 6.2 Instancia en AWS — [captura placeholder]
- 6.3 Ejecución Local vía `docker-compose` — [captura placeholder]
- 6.4 App Web Operativa en Producción (HTTP puerto 80) — [captura placeholder]

## 7. Conclusiones y Aprendizajes
- Seguridad con GitHub Secrets: clave para proteger credenciales y accesos, evitando incrustar secretos en el repositorio.
- Calidad Mandatoria: integrar `ESLint` y `Jest` asegura calidad de código y reduce regresiones antes del despliegue.
- Portabilidad con Docker: contenedores garantizan comportamiento consistente entre desarrollo y producción.
- Eficiencia DevOps: automatizar CI/CD reduce tiempo de entrega, errores manuales y facilita entregas frecuentes y seguras.
