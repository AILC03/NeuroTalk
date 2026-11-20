# Revisión de dependencias — SDK 58

## Resultado actual

**Auditoría: 15 alertas altas, cero moderadas y cero críticas. No está resuelta para publicación.** Se partió de 22 alertas (15 altas y siete moderadas). Son paquetes afectados y propagaciones en el árbol, no 22 vulnerabilidades raíz independientes.

No se ejecutó `npm audit fix --force`, no se degradó Expo a SDK 44 y no se ocultaron dependencias al auditar. Tampoco se sustituyeron paquetes criptográficos por stubs ni se cambiaron versiones para engañar al auditor.

## Cambios aplicados

1. Expo estable `58.0.12` → `58.0.14`, conservando SDK 58 y React Native `0.88.0`.
2. TypeScript ajustado a `~6.0.3`, versión recomendada por `expo install --check` para este SDK. El backend mantiene su configuración independiente.
3. Override **limitado a `xcode → uuid`**, fijado en `11.1.1`. No es una actualización ciega de todo el árbol:
   - `xcode@3.0.1` usa `require('uuid').v4()` para generar identificadores de proyecto.
   - uuid 11.1.1 conserva CommonJS y `v4`; evita el rango vulnerable `<11.1.1` de GHSA-w5hq-g745-h8pq.
   - `tests/dependencies.test.ts` comprueba la versión, `v4` y 100 identificadores únicos de 24 caracteres mediante `xcode.project().generateUuid()` con un proyecto vacío en memoria.
   - El override debe revisarse al actualizar Expo/xcode; no es una recomendación general para otras APIs de uuid.
4. `package-lock.json` regenerado con npm; instalación auditada incluyendo el árbol completo, no solo una selección de paquetes.

Resultado: desaparecen las siete alertas moderadas asociadas a uuid y su propagación.

## Bloqueos upstream comprobados

### braces

- Instalado: `3.0.3`, a través de Metro → metro-file-map → micromatch.
- [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), CVE-2026-93687.
- Rango publicado vulnerable: `<=3.0.3`; el aviso oficial consultado indica `first_patched_version: null`.
- npm sigue publicando 3.0.3 como versión más reciente al realizar esta revisión.
- Riesgo: agotamiento de pila por patrones de llaves profundamente anidados. Es parte de las herramientas de búsqueda/bundling; los mensajes del usuario no se pasan como patrones a esa biblioteca.

### node-forge

- Instalado: `1.4.0`, mediante Expo CLI y sus herramientas de certificados/firma.
- [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), CVE-2026-85393.
- Rango publicado vulnerable: `<=1.4.0`; el aviso oficial consultado indica `first_patched_version: null`.
- npm sigue publicando 1.4.0 como versión más reciente al realizar esta revisión.
- Riesgo: validación incompleta de estructuras ASN.1 en firmas RSA PKCS#1 v1.5. La app no utiliza node-forge para autenticar cuentas; eso no elimina el hallazgo del árbol instalado.

Las fuentes pueden cambiar: repetir la consulta y auditoría antes de publicar. No marcar estas vulnerabilidades como corregidas hasta incorporar una solución verificable.

## Medidas provisionales para pruebas escolares

- Mantener desarrollo local, sin exponer Metro a Internet ni aceptar patrones/configuraciones de terceros no confiables.
- Usar emulador y bases/cuentas ficticias; no operar como servicio público ni manejar datos sensibles.
- No incorporar firma/verificación criptográfica propia basada en node-forge.
- Mantener el lockfile y revisar correcciones oficiales de Expo/Metro, braces y node-forge.

Estas medidas reducen exposición, **no son parches** ni una aprobación de publicación. Evitar un dev server público no prueba ausencia de riesgo durante instalación o build.

## Comprobaciones reproducibles

```powershell
npm ci --ignore-scripts
npm run typecheck
npm test
npx expo install --check
npm run build:web
npm audit
npm ls uuid braces node-forge --all
```

La revisión web posterior amplió la batería a **14 tests unitarios** (incluida regresión xcode/uuid) y **dos E2E de navegador**; typecheck, compatibilidad Expo y exportación web también pasan. La entrega móvil está pospuesta y estas pruebas no inician Android. `npm audit` sigue devolviendo salida de error por las 15 alertas altas: es el resultado esperado hasta resolver los dos bloqueos.

No confundir exportación web correcta, prueba en Expo Go o ausencia de fallos visibles con una auditoría de seguridad aprobada. Una APK de distribución requerirá además compilación y prueba propias.
