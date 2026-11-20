# components — interfaz reutilizable

- `ui.tsx`: botones accesibles, campos, tarjetas, categorías, badges, avisos, carga/vacío, encabezado y confirmación de borrado. Usa tokens de `theme` y Lucide; no contiene llamadas HTTP ni cifras de demostración.
- `Shell.tsx`: contenedor responsive. Navegación inferior en anchos menores de 1,000 px y barra lateral en escritorio. El chat oculta la navegación para salir mediante pausa explícita.
- `icons.ts`: reexportaciones selectivas desde rutas públicas de Lucide para no empaquetar su catálogo completo.

Fuente visual: mockups Figma compartidos por el responsable, revisados visualmente en navegador. Verde/crema, tarjetas redondeadas y categorías diferenciadas; adaptación web propia, no copia de un marco de teléfono.

Los controles deben conservar etiquetas, foco/teclado web y estados de accesibilidad. Las confirmaciones destructivas no ejecutan su acción al abrirse. No añadir componentes que muestren supuestas calificaciones o feedback no generado.

`Field` vincula ayuda/error con aria-describedby y marca aria-invalid, sin depender únicamente de un borde rojo. Los formularios muestran errores al lado del campo correspondiente.
