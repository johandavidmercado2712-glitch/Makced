import "./page.css";
import Link from "next/link";
import {
  Package,
  Tag,
  Box,
  Ticket,
  ExternalLink,
  Star,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Store,
  Check,
} from "lucide-react";
import { getTienda } from "@/actions/tienda";
import { getResumenStats, getProductosDestacados } from "@/actions/resumen";
import { EmptyState } from "@/components/EmptyState";
import { urlImagen } from "@/lib/imagenes";
import { listarMarcas, listarCategorias } from "@/actions/marcas";

const URL_TIENDA = process.env.NEXT_PUBLIC_TIENDA_URL ?? "http://localhost:3000";

function saludoDinamico(): { texto: string; emoji?: string } {
  const hora = new Date().getHours();
  
  if (hora < 12) {
    return { texto: "Buenos días", emoji: "☀️" };
  }
  if (hora < 19) {
    return { texto: "Buenas tardes" };
  }
  return { texto: "Buenas noches", emoji: "🌙" };
}

function haceDesde(fechaISO: string): string {
  const ahora = Math.floor(Date.now() / 1000);
  const creado = Date.parse(fechaISO);
  if (Number.isNaN(creado)) return "";
  const segundos = ahora - creado;
  if (segundos < 60) return "hace unos segundos";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

export default async function DashboardPage() {
  const [tienda, stats, destacados, marcas, categorias] = await Promise.all([
    getTienda(),
    getResumenStats(),
    getProductosDestacados(),
    listarMarcas(),
    listarCategorias(),
  ]);

  const saludo = saludoDinamico();

  // Calcular progreso de onboarding
  const progreso = {
    marcas: marcas.length > 0,
    categorias: categorias.length > 0,
    productos: stats.productos > 0,
  };
  const pasosCompletados = Object.values(progreso).filter(Boolean).length;
  const porcentajeProgreso = (pasosCompletados / 3) * 100;

  return (
    <div className="dashboard db-home-dashboard">
      {/* ─── ENCABEZADO CON JERARQUÍA VISUAL ─── */}
      <div className="db-panel db-header db-home-header">
        <div className="db-header-left">
          <span className="db-greeting">
            {saludo.texto}, {tienda?.propietario ?? "administrador"}
            {saludo.emoji && <span aria-hidden="true" className="db-greeting-emoji"> {saludo.emoji}</span>}
          </span>
          <h1 className="db-title">Tu catálogo, al día</h1>
          <p className="db-subtitle">
            Revisa los modelos que presentas en{" "}
            <strong>{tienda?.nombre_tienda ?? "tu tienda"}</strong> y continúa
            actualizando tu catálogo.
          </p>
        </div>
        <div className="db-header-actions">
          <a
            className="db-btn-primary db-header-cta"
            href={URL_TIENDA}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Ver mi tienda</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {stats.productos === 0 ? (
        <section className="db-panel db-onboard-panel">
          <EmptyState
            icon={Store}
            titulo="Bienvenida a tu panel de administracion"
            descripcion="Tu tienda esta lista, pero tu catalogo necesita productos. Sigue estos pasos para tener tu tienda online funcionando."
          />
          
          {/* Barra de progreso */}
          <div className="db-onboard-progress">
            <div className="db-onboard-progress-header">
              <span className="db-onboard-progress-label">
                {pasosCompletados === 0 && "Comencemos"}
                {pasosCompletados === 1 && "¡Buen comienzo!"}
                {pasosCompletados === 2 && "¡Casi listo!"}
                {pasosCompletados === 3 && "¡Tu catálogo está completo!"}
              </span>
              <span className="db-onboard-progress-count">{pasosCompletados}/3</span>
            </div>
            <div className="db-onboard-progress-bar">
              <div 
                className="db-onboard-progress-fill" 
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
          </div>

          <div className="db-onboard-steps">
            <div className={`db-onboard-step ${progreso.marcas ? 'db-onboard-step-completed' : ''}`}>
              <span className="db-onboard-num">
                {progreso.marcas ? <Check size={16} /> : "1"}
              </span>
              <div className="db-onboard-content">
                <h3>Crea marcas y categorias</h3>
                <p>Organiza tu catalogo. Las marcas agrupan por fabricante, las categorias por tipo de producto.</p>
                {!progreso.marcas && (
                  <Link href="/marcas" className="db-onboard-link">
                    Ir a Marcas y categorias <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
            <div className={`db-onboard-step ${progreso.productos ? 'db-onboard-step-completed' : ''}`}>
              <span className="db-onboard-num">
                {progreso.productos ? <Check size={16} /> : "2"}
              </span>
              <div className="db-onboard-content">
                <h3>Agrega tu primer producto</h3>
                <p>Nombre, precio, imagen y categoria. En menos de 2 minutos tendras tu primer producto en la tienda.</p>
                {!progreso.productos && (
                  <Link href="/productos" className="db-onboard-link">
                    Ir a Productos <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
            <div className="db-onboard-step">
              <span className="db-onboard-num">3</span>
              <div className="db-onboard-content">
                <h3>Destaca productos en portada</h3>
                <p>Elige los modelos que quieres que tus clientes vean primero. Marca como destacado cualquier producto.</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="db-destacados-section">
        <div className="db-panel-header">
          <div className="db-panel-title-group">
            <div>
              <h2>En portada</h2>
              <p className="db-panel-desc">
                Modelos que tus clientes ven primero en la tienda.
              </p>
            </div>
          </div>
          <Link href="/productos" className="db-panel-action">
            <span>Gestionar catálogo</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {destacados.length === 0 ? (
          <div className="db-empty-destacados">
            <Sparkles size={28} className="db-empty-icon" />
            <p className="db-empty-title">Aún no tienes productos destacados</p>
            <p className="db-empty-desc">
              Marca los productos que quieras resaltar para que aparezcan en el carrusel y portada.
            </p>
            <Link href="/productos" className="db-empty-btn">
              Ir a Productos
            </Link>
          </div>
        ) : (
          <>
            <article className="db-featured-spotlight">
              <Link
                href="/productos"
                className="db-featured-spotlight-image"
                aria-label={`Gestionar ${destacados[0].nombre} en Productos`}
              >
                {destacados[0].imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={urlImagen(destacados[0].imagen_url)} alt="" loading="lazy" />
                ) : (
                  <ImageIcon size={42} aria-hidden="true" />
                )}
              </Link>
              <div className="db-featured-spotlight-copy">
                <span className="db-featured-tag">
                  <Star size={12} aria-hidden="true" /> Selección de portada
                </span>
                <h3>{destacados[0].nombre}</h3>
                <strong>${destacados[0].precio.toLocaleString("es-CO")}</strong>
                <p className="db-featured-meta">
                  <span>
                    {destacados[0].categoria?.nombre ?? "Sin categoría"}
                  </span>
                  <span
                    className={
                      destacados[0].estado
                        ? "db-featured-status db-featured-status-active"
                        : "db-featured-status"
                    }
                  >
                    {destacados[0].estado ? "Activo" : "Inactivo"}
                  </span>
                </p>
                <Link href="/productos" className="db-featured-edit">
                  Revisar producto <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
            {destacados.length > 1 && (
              <div className="db-featured-grid">
                {destacados.slice(1).map((p) => (
                  <article key={p.id} className="db-featured-card">
                    <Link
                      href="/productos"
                      className="db-featured-image"
                      aria-label={`Gestionar ${p.nombre} en Productos`}
                    >
                      {p.imagen_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={urlImagen(p.imagen_url)} alt="" loading="lazy" />
                      ) : (
                        <ImageIcon size={30} aria-hidden="true" />
                      )}
                    </Link>
                    <div className="db-featured-info">
                      <div>
                        <p className="db-featured-name">{p.nombre}</p>
                        <span className="db-featured-tag">
                          <Star size={12} aria-hidden="true" /> En portada
                        </span>
                      </div>
                      <strong className="db-featured-price">
                        ${p.precio.toLocaleString("es-CO")}
                      </strong>
                    </div>
                    <p className="db-featured-meta">
                      <span>{p.categoria?.nombre ?? "Sin categoría"}</span>
                      <span
                        className={
                          p.estado
                            ? "db-featured-status db-featured-status-active"
                            : "db-featured-status"
                        }
                      >
                        {p.estado ? "Activo" : "Inactivo"}
                      </span>
                    </p>
                    <Link href="/productos" className="db-featured-edit">
                      Gestionar catálogo <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="db-catalog-summary" aria-label="Resumen del catálogo">
        <Link href="/productos">
          <Package size={17} aria-hidden="true" />
          <strong>{stats.productos}</strong>
          <span>productos</span>
        </Link>
        <Link href="/marcas">
          <Tag size={17} aria-hidden="true" />
          <strong>{stats.marcas}</strong>
          <span>marcas</span>
        </Link>
        <Link href="/marcas">
          <Box size={17} aria-hidden="true" />
          <strong>{stats.categorias}</strong>
          <span>categorías</span>
        </Link>
        <Link href="/productos">
          <Ticket size={17} aria-hidden="true" />
          <strong>{stats.cupones}</strong>
          <span>cupones</span>
        </Link>
        {stats.ultimoActivo && (
          <p className="db-resumen-ultimos">
            <span className="db-resumen-ultimos-dot" aria-hidden="true" />
            {haceDesde(stats.ultimoActivo)}
          </p>
        )}
      </section>
        </>
      )}
    </div>
  );
}
