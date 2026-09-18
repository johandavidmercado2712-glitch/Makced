import "./administrador.css";
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

const orders = [
  { id: "MK-149", initials: "CM", client: "Cliente MAKCED", date: "2026-09-15", items: "1 artículos", price: "399.900", status: "pendiente" as const },
  { id: "MK-148", initials: "CM", client: "Cliente MAKCED", date: "2026-09-15", items: "1 artículos", price: "459.900", status: "pendiente" as const },
  { id: "MK-142", initials: "CM", client: "Cliente MAKCED", date: "2026-08-20", items: "1 artículos", price: "459.900", status: "entregado" as const },
];

const statusConfig = {
  pendiente: { icon: Clock, color: "amber" },
  entregado: { icon: CheckCircle, color: "green" },
  enviado: { icon: Truck, color: "blue" },
};

export default function AdministradorPage() {
  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <p className="db-greeting">Buenas Tardes · Jueves, 17 De Septiembre 👋</p>
          <h1 className="db-title">Administrador</h1>
          <p className="db-subtitle">Tienes 2 pedidos pendientes por enviar.</p>
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
          <h3 className="db-card-value">12</h3>
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
          {orders.map((o) => {
            const { icon: StatusIcon, color } = statusConfig[o.status];
            return (
              <div key={o.id} className="db-order-row">
                <div className="db-order-avatar">{o.initials}</div>
                <div className="db-order-info">
                  <p className="db-order-id">{o.id} · {o.client}</p>
                  <p className="db-order-date">{o.date} · {o.items}</p>
                </div>
                <div className="db-order-right">
                  <span className="db-order-price">${o.price}</span>
                  <span className={`db-order-status db-status-${color}`}>
                    <StatusIcon size={12} /> {o.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="db-stats-right">
          <div className="db-panel">
            <div className="db-panel-header">
              <h2>Pedidos por estado <HelpCircle size={16} /></h2>
            </div>
            <div className="db-status-row db-status-bg-amber">
              <div className="db-status-icon db-status-icon-amber"><Clock size={20} /></div>
              <span className="db-status-label">Pendiente</span>
              <span className="db-status-count">2</span>
            </div>
            <div className="db-status-row db-status-bg-blue">
              <div className="db-status-icon db-status-icon-blue"><Truck size={20} /></div>
              <span className="db-status-label">Enviado</span>
              <span className="db-status-count">1</span>
            </div>
            <div className="db-status-row db-status-bg-green">
              <div className="db-status-icon db-status-icon-green"><CheckCircle size={20} /></div>
              <span className="db-status-label">Entregado</span>
              <span className="db-status-count">1</span>
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
