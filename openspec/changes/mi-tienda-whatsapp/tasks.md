# Tasks

## 1. Migración DB

- [x] 1.1 Ejecutar SQL para agregar `whatsapp_numero TEXT` (nullable) a la tabla `tiendas` vía InsForge CLI; verificar con query `SELECT column_name FROM information_schema.columns WHERE table_name='tiendas' AND column_name='whatsapp_numero'`

## 2. Tipos y Server Action

- [x] 2.1 Agregar `whatsapp_numero: string | null` al interface `Tienda` en `apps/dashboard/types/database.ts` y al SELECT de `getTiendaPublica()` en `actions/tienda.ts`; verificar typecheck
- [x] 2.2 Crear `updateTiendaWhatsapp(numero: string)` en `actions/tienda.ts` con validación `/^\d{8,15}$/`, `requireTiendaDelUsuario()`, UPDATE + revalidatePath; verificar typecheck

## 3. Dashboard — panel WhatsApp

- [x] 3.1 En `mi-tienda/page.tsx`: eliminar el panel "Accesos rápidos" y sus imports no usados (`Box`, `Palette`, `Package`, `Link`); verificar typecheck
- [x] 3.2 Crear componente client `components/PanelWhatsapp.tsx` (input numérico + botón Guardar + feedback ok/error) que llama a `updateTiendaWhatsapp`; verificar typecheck
- [x] 3.3 Insertar `<PanelWhatsapp numero={tienda.whatsapp_numero} />` en el grid de `mi-tienda/page.tsx` en la posición del panel eliminado; verificar typecheck
- [x] 3.4 En `mi-tienda.css`: eliminar `.mt-accesos`/`.mt-acceso` y responsive; agregar estilos del panel WhatsApp (input, botón, feedback) siguiendo design tokens; verificar typecheck

## 4. Store — usar número en carrito

- [x] 4.1 En `carrito/page.tsx`: obtener `whatsapp_numero` de la tienda (fetch público con SDK al montar) y construir `wa.me/{numero}?text=` o `wa.me/?text=` como fallback; verificar typecheck

## 5. Verificación final

- [x] 5.1 Correr `npm run typecheck` en la raíz del monorepo y verificar 3/3 paquetes exitosos sin errores
