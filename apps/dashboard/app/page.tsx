import "./page.css";
import Link from "next/link";
import {
  Package,
  Tag,
  Box,
  Ticket,
  ExternalLink,
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
      <div className="db-panel db-header">
        <div>
          <p className="db-greeting">
            {saludoPorHora()}, {tienda?.propietario ?? "administrador"} 👋
          </p>
          <h1 className="db-title">Resumen</h1>
          <p className="db-subtitle">
            Un vistazo rápido de {tienda?.nombre_tienda ?? "tu tienda"}.
          </p>
        </div>
        <div className="db-header-actions">
          <a
            className="db-btn-primary"
            href={URL_TIENDA}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver mi tienda <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <div className="db-cards">
        <div className="db-summary-card db-card-green">
          <div className="db-card-icon"><Package size={20} /></div>
          <h3 className="db-card-value">{stats.productos}</h3>
          <p className="db-card-label">Productos</p>
          <p className="db-card-sublabel">
            {stats.destacados > 0
              ? `${stats.destacados} destacados`
              : "Ninguno destacado todavía"}
          </p>
        </div>
        <div className="db-summary-card db-card-blue">
          <div className="db-card-icon"><Tag size={20} /></div>
          <h3 className="db-card-value">{stats.marcas}</h3>
          <p className="db-card-label">Marcas</p>
          <p className="db-card-sublabel">En filtros y navegación</p>
        </div>
        <div className="db-summary-card db-card-cyan">
          <div className="db-card-icon"><Box size={20} /></div>
          <h3 className="db-card-value">{stats.categorias}</h3>
          <p className="db-card-label">Categorías</p>
          <p className="db-card-sublabel">Secciones del catálogo</p>
        </div>
        <div className="db-summary-card db-card-magenta">
          <div className="db-card-icon"><Ticket size={20} /></div>
          <h3 className="db-card-value">{stats.cupones}</h3>
          <p className="db-card-label">Cupones</p>
          <p className="db-card-sublabel">
            {stats.cupones > 0 ? "Disponibles en tu tienda" : "Aún no hay cupones"}
          </p>
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <h2>Productos destacados</h2>
          <Link href="/productos">Ver productos</Link>
        </div>
        {destacados.length === 0 ? (
          <p style={{ color: "var(--db-text-muted)", fontSize: 14, padding: "20px 0" }}>
            Aún no tienes productos destacados. Marca los que quieras resaltar desde la
            página <Link href="/productos">Productos</Link>.
          </p>
        ) : (
          destacados.map((p, i) => (
            <div key={p.id} className="db-bestseller-row">
              <span className="db-rank">{i + 1}</span>
              <div className="db-bestseller-info">
                <p className="db-bestseller-name">{p.nombre}</p>
                <p className="db-bestseller-units">${p.precio.toLocaleString("es-CO")}</p>
              </div>
              <a
                href="/productos"
                className="db-bestseller-link"
                aria-label={`Ver ${p.nombre} en Productos`}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
