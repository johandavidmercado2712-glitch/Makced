import "./page.css";
import {
  TrendingUp,
  CreditCard,
  Package,
  Ticket,
  Clock,
  Truck,
  CheckCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { getProductos, getProductosCount } from "@/actions/products";
import { getTienda } from "@/actions/tienda";
import { getPedidosRecientes } from "@/actions/pedidos";

const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
  pendiente: { icon: Clock, color: "amber" },
  pagado: { icon: CheckCircle, color: "green" },
  enviado: { icon: Truck, color: "blue" },
  entregado: { icon: CheckCircle, color: "green" },
  cancelado: { icon: Clock, color: "amber" },
};

export default async function DashboardPage() {
  const tienda = await getTienda();
  const [productos, totalProductos, pedidos] = await Promise.all([
    getProductos(),
    getProductosCount(),
    getPedidosRecientes(),
  ]);

  const pendientes = pedidos.filter((p) => p.estado_pedido === "pendiente").length;

  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <p className="db-greeting">Buenas Tardes, {tienda?.propietario} 👋</p>
          <h1 className="db-title">Administrador</h1>
          <p className="db-subtitle">
            {pendientes > 0
              ? `Tienes ${pendientes} pedidos pendientes por enviar.`
              : "No hay pedidos pendientes."}
          </p>
        </div>
        <div className="db-header-actions">
          <button className="db-btn-primary">Gestionar pedidos</button>
          <button className="db-btn-secondary">¿Cómo funciona?</button>
        </div>
      </div>

      <div className="db-cards">
        <div className="db-summary-card db-card-green">
          <div className="db-card-icon"><TrendingUp size={20} /></div>
          <span className="db-card-info"><HelpCircle size={16} /></span>
          <h3 className="db-card-value">$1.359.700</h3>
          <p className="db-card-label">Ingresos</p>
          <p className="db-card-sublabel">2 pedidos confirmados</p>
        </div>
        <div className="db-summary-card db-card-blue">
          <div className="db-card-icon"><CreditCard size={20} /></div>
          <span className="db-card-info"><HelpCircle size={16} /></span>
          <h3 className="db-card-value">$679.850</h3>
          <p className="db-card-label">Ticket promedio</p>
          <p className="db-card-sublabel">5 artículos vendidos</p>
        </div>
        <div className="db-summary-card db-card-cyan">
          <div className="db-card-icon"><Package size={20} /></div>
          <span className="db-card-info"><HelpCircle size={16} /></span>
          <h3 className="db-card-value">{totalProductos}</h3>
          <p className="db-card-label">Productos</p>
          <p className="db-card-sublabel">5 destacados</p>
        </div>
        <div className="db-summary-card db-card-magenta">
          <div className="db-card-icon"><Ticket size={20} /></div>
          <span className="db-card-info"><HelpCircle size={16} /></span>
          <h3 className="db-card-value">3</h3>
          <p className="db-card-label">Cupones activos</p>
          <p className="db-card-sublabel">3 creados en total</p>
        </div>
      </div>

      <div className="db-bottom">
        <div className="db-panel">
          <div className="db-panel-header">
            <h2>Últimos pedidos <HelpCircle size={16} /></h2>
            <a href="#">Ver todos</a>
          </div>
          {pedidos.length === 0 ? (
            <p style={{ color: "var(--db-text-muted)", fontSize: 14, padding: "20px 0" }}>
              No hay pedidos aún
            </p>
          ) : (
            pedidos.map((p) => {
              const { icon: StatusIcon, color } = statusConfig[p.estado_pedido] || statusConfig.pendiente;
              return (
                <div key={p.id} className="db-order-row">
                  <div className="db-order-avatar">{p.cliente_nombre?.[0] || "C"}</div>
                  <div className="db-order-info">
                    <p className="db-order-id">{p.cliente_nombre}</p>
                    <p className="db-order-date">{p.created_at?.slice(0, 10)}</p>
                  </div>
                  <div className="db-order-right">
                    <span className="db-order-price">${p.total?.toLocaleString("es-CO")}</span>
                    <span className={`db-order-status db-status-${color}`}>
                      <StatusIcon size={12} /> {p.estado_pedido}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="db-stats-right">
          <div className="db-panel">
            <div className="db-panel-header">
              <h2>Pedidos por estado <HelpCircle size={16} /></h2>
            </div>
            <div className="db-status-row db-status-bg-amber">
              <div className="db-status-icon db-status-icon-amber"><Clock size={20} /></div>
              <span className="db-status-label">Pendiente</span>
              <span className="db-status-count">{pedidos.filter((p) => p.estado_pedido === "pendiente").length}</span>
            </div>
            <div className="db-status-row db-status-bg-blue">
              <div className="db-status-icon db-status-icon-blue"><Truck size={20} /></div>
              <span className="db-status-label">Enviado</span>
              <span className="db-status-count">{pedidos.filter((p) => p.estado_pedido === "enviado").length}</span>
            </div>
            <div className="db-status-row db-status-bg-green">
              <div className="db-status-icon db-status-icon-green"><CheckCircle size={20} /></div>
              <span className="db-status-label">Entregado</span>
              <span className="db-status-count">{pedidos.filter((p) => p.estado_pedido === "entregado").length}</span>
            </div>
          </div>

          <div className="db-panel">
            <div className="db-panel-header">
              <h2>Más vendidos <HelpCircle size={16} /></h2>
            </div>
            <div className="db-bestseller-row">
              <span className="db-rank">1</span>
              <div className="db-bestseller-info">
                <p className="db-bestseller-name">Dunk Low Retro</p>
                <p className="db-bestseller-units">2 unidades</p>
              </div>
              <ExternalLink size={16} className="db-bestseller-link" />
            </div>
            <div className="db-bestseller-row">
              <span className="db-rank">2</span>
              <div className="db-bestseller-info">
                <p className="db-bestseller-name">Air Max 270</p>
                <p className="db-bestseller-units">1 unidad</p>
              </div>
              <ExternalLink size={16} className="db-bestseller-link" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
