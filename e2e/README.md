# Pruebas web de extremo a extremo

`web.spec.ts` usa un navegador Edge headless ya instalado, un único worker y cuentas ficticias únicas. No inicia Android Studio, emuladores ni procesos nativos.

Playwright inicia y detiene sus propios servidores en 8088/3018. El backend exige TEST_DATABASE_URL local e independiente, con migraciones aplicadas; carga el catálogo sin borrar datos existentes. Cada caso elimina solo su cuenta ficticia mediante la API. No se ejecutan migraciones ni se resetean bases desde esta suite.

`npm run test:e2e` desde este repositorio. Requiere dependencias y cliente Prisma preparados en el repositorio hermano. No reusa servidores existentes ni ocupa los puertos normales de la demostración.

Incluye un recorrido escritorio 1366×900 y otro de navegador de 390×844, también con chat y compositor. Ese viewport **no equivale a Android real**. Trace/video desactivados para no guardar cookies/headers; capturas de revisión/fallo y resultados temporales están fuera de Git. La suite no utiliza credenciales de personas reales ni OpenAI. No hace falta instalar un navegador adicional si Edge ya está disponible.
