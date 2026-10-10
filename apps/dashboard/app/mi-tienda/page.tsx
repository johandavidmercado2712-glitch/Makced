import Link from "next/link";
import "../productos/productos.css";
import "./mi-tienda.css";
import {
  Box,
  ExternalLink,
  Lock,
  Package,
  Palette,
  Store,
  User,
} from "lucide-react";
import { getTienda, getUsuarioTienda } from "@/actions/tienda";
import CambiarContrasena from "@/components/CambiarContrasena";

const URL_TIENDA = process.env.NEXT_PUBLIC_TIENDA_URL ?? "http://localhost:3000";

const fechaLarga = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default async function MiTiendaPage() {
  const tienda = await getTienda();

  if (!tienda) {
    return (
      <div className="dashboard">
        <div className="db-panel">
          <h1 className="db-title">Mi tienda</h1>
          <p className="db-subtitle">No hay ninguna tienda activa asociada a esta cuenta.</p>
        </div>
      </div>
    );
  }

  const usuario = await getUsuarioTienda(tienda.usuario_id);
  const nombreCompleto = usuario?.nombre?.trim() ? usuario.nombre : "—";

  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <h1 className="db-title">Mi tienda</h1>
          <p className="db-subtitle">
            Toda la información de tu cuenta y tu tienda en un solo lugar.
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

      <div className="mt-grid">
        <section className="db-panel">
          <div className="mt-head">
            <span className="mt-head-icon"><User size={16} /></span>
            <h2>Tu cuenta</h2>
          </div>
          <dl>
            <div className="mt-fila">
              <dt>Nombre</dt>
              <dd>{nombreCompleto}</dd>
            </div>
            <div className="mt-fila">
              <dt>Email</dt>
              <dd>{usuario?.email ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="db-panel">
          <div className="mt-head">
            <span className="mt-head-icon"><Store size={16} /></span>
            <h2>Tu tienda</h2>
          </div>
          <dl>
            <div className="mt-fila">
              <dt>Nombre</dt>
              <dd>{tienda.nombre_tienda}</dd>
            </div>
            <div className="mt-fila">
              <dt>Propietario</dt>
              <dd>{tienda.propietario ?? "—"}</dd>
            </div>
            <div className="mt-fila">
              <dt>Subdominio</dt>
              <dd>
                <a className="mt-url" href={URL_TIENDA} target="_blank" rel="noopener noreferrer">
                  {tienda.subdominio} <ExternalLink size={13} />
                </a>
              </dd>
            </div>
            <div className="mt-fila">
              <dt>Plan actual</dt>
              <dd><span className="mt-badge">{tienda.plan_actual}</span></dd>
            </div>
            <div className="mt-fila">
              <dt>Descripción</dt>
              <dd>{tienda.descripcion ?? "—"}</dd>
            </div>
            <div className="mt-fila">
              <dt>Estado</dt>
              <dd>
                <span className={`mt-badge ${tienda.activa ? "mt-badge-activa" : "mt-badge-inactiva"}`}>
                  {tienda.activa ? "Activa" : "Inactiva"}
                </span>
              </dd>
            </div>
            <div className="mt-fila">
              <dt>Plantilla</dt>
              <dd>{tienda.plantilla_id ?? "Por defecto"}</dd>
            </div>
            <div className="mt-fila">
              <dt>Creada el</dt>
              <dd>{fechaLarga(tienda.created_at)}</dd>
            </div>
          </dl>
        </section>

        <section className="db-panel">
          <div className="mt-head">
            <span className="mt-head-icon"><Lock size={16} /></span>
            <h2>
              Contraseña
              <span className="mt-badge mt-badge-prox">Próximamente</span>
            </h2>
          </div>
          <CambiarContrasena email={usuario?.email ?? null} />
        </section>

        <section className="db-panel">
          <div className="mt-head">
            <span className="mt-head-icon"><Box size={16} /></span>
            <h2>Accesos rápidos</h2>
          </div>
          <div className="mt-accesos">
            <Link className="mt-acceso" href="/diseno">
              <Palette size={15} /> Editar diseño
            </Link>
            <Link className="mt-acceso" href="/productos">
              <Package size={15} /> Catálogo de productos
            </Link>
            <a className="mt-acceso" href={URL_TIENDA} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} /> Ver tienda
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
