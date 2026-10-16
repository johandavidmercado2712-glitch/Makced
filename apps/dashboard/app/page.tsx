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
} from "lucide-react";
import { getTienda } from "@/actions/tienda";
import { getResumenStats, getProductosDestacados } from "@/actions/resumen";

const URL_TIENDA = process.env.NEXT_PUBLIC_TIENDA_URL ?? "http://localhost:3000";

function saludoPorHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default async function DashboardPage() {
  const [tienda, stats, destacados] = await Promise.all([
    getTienda(),
    getResumenStats(),
    getProductosDestacados(),
  ]);

  return (
    <div className="dashboard">
      {/* ─── ENCABEZADO CON JERARQUÍA VISUAL ─── */}
      <div className="db-panel db-header">
        <div className="db-header-left">
          <div className="db-header-badge">
            <span className="db-status-pulse" />
            <span className="db-status-text">Tienda activa</span>
            <span className="db-status-dot">•</span>
            <span className="db-greeting">{saludoPorHora()}, {tienda?.propietario ?? "administrador"} 👋</span>
          </div>
          <h1 className="db-title">Panel de Resumen</h1>
          <p className="db-subtitle">
            Métricas de inventario y estado general de <strong>{tienda?.nombre_tienda ?? "tu tienda"}</strong>.
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

      {/* ─── TARJETAS DE MÉTRICAS (STAT CARDS) ─── */}
      <div className="db-cards">
        <div className="db-summary-card db-card-green">
          <div className="db-card-top">
            <span className="db-card-category">Catálogo</span>
            <div className="db-card-icon"><Package size={18} /></div>
          </div>
          <div className="db-card-main">
            <h3 className="db-card-value">{stats.productos}</h3>
            <p className="db-card-label">Productos totales</p>
          </div>
          <div className="db-card-footer">
            <span className="db-card-pill db-pill-green">
              <span className="db-pill-dot" />
              {stats.destacados > 0
                ? `${stats.destacados} destacados en web`
                : "Ninguno destacado"}
            </span>
          </div>
        </div>

        <div className="db-summary-card db-card-blue">
          <div className="db-card-top">
            <span className="db-card-category">Filtros</span>
            <div className="db-card-icon"><Tag size={18} /></div>
          </div>
          <div className="db-card-main">
            <h3 className="db-card-value">{stats.marcas}</h3>
            <p className="db-card-label">Marcas registradas</p>
          </div>
          <div className="db-card-footer">
            <span className="db-card-pill db-pill-blue">
              <span className="db-pill-dot" />
              Activas en catálogo
            </span>
          </div>
        </div>

        <div className="db-summary-card db-card-cyan">
          <div className="db-card-top">
            <span className="db-card-category">Estructura</span>
            <div className="db-card-icon"><Box size={18} /></div>
          </div>
          <div className="db-card-main">
            <h3 className="db-card-value">{stats.categorias}</h3>
            <p className="db-card-label">Categorías creadas</p>
          </div>
          <div className="db-card-footer">
            <span className="db-card-pill db-pill-cyan">
              <span className="db-pill-dot" />
              Secciones del menú
            </span>
          </div>
        </div>

        <div className="db-summary-card db-card-magenta">
          <div className="db-card-top">
            <span className="db-card-category">Marketing</span>
            <div className="db-card-icon"><Ticket size={18} /></div>
          </div>
          <div className="db-card-main">
            <h3 className="db-card-value">{stats.cupones}</h3>
            <p className="db-card-label">Cupones de oferta</p>
          </div>
          <div className="db-card-footer">
            <span className="db-card-pill db-pill-magenta">
              <span className="db-pill-dot" />
              {stats.cupones > 0 ? "Disponibles en tienda" : "Sin cupones activos"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── PRODUCTOS DESTACADOS ─── */}
      <div className="db-panel db-destacados-panel">
        <div className="db-panel-header">
          <div className="db-panel-title-group">
            <div className="db-panel-icon-wrap">
              <Star size={18} />
            </div>
            <div>
              <h2>Productos destacados en portada</h2>
              <p className="db-panel-desc">Artículos visibles con prioridad en la página de inicio</p>
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
          <div className="db-bestseller-list">
            {destacados.map((p, i) => (
              <div key={p.id} className="db-bestseller-row">
                <span className={`db-rank db-rank-${i + 1}`}>{i + 1}</span>
                <div className="db-bestseller-info">
                  <p className="db-bestseller-name">{p.nombre}</p>
                  <span className="db-bestseller-tag">
                    <Star size={10} /> En portada
                  </span>
                </div>
                <div className="db-bestseller-price">
                  <span className="db-bestseller-units">
                    ${p.precio.toLocaleString("es-CO")}
                  </span>
                </div>
                <Link
                  href="/productos"
                  className="db-bestseller-link"
                  aria-label={`Ver ${p.nombre} en Productos`}
                  title="Ver en Productos"
                >
                  <ExternalLink size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
