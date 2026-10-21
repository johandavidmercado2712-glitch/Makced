import { Globe, Camera, MessageCircle } from "lucide-react";
import Link from "next/link";
import {
  esEnlacePieVisible,
  esUrlPieValida,
  type ConfigDiseno,
  type EnlacePie,
} from "@makced/db/diseno";
import "./footer.css";

interface FooterProps {
  categorias?: { id: string; nombre: string; slug: string }[];
  pie: ConfigDiseno["pie"];
}

function EnlaceFooter({ enlace }: { enlace: EnlacePie }) {
  if (enlace.url.startsWith("/")) {
    return <Link href={enlace.url}>{enlace.etiqueta}</Link>;
  }

  const externo = /^https?:/i.test(enlace.url);
  return (
    <a
      href={enlace.url}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {enlace.etiqueta}
    </a>
  );
}

function Footer({ categorias = [], pie }: FooterProps) {
  const informacion = pie.informacion.filter(esEnlacePieVisible);
  const ayuda = pie.ayuda.filter(esEnlacePieVisible);

  const redes = [
    { url: pie.web_url, label: "Sitio web", Icono: Globe },
    { url: pie.instagram_url, label: "Instagram", Icono: Camera },
    { url: pie.whatsapp_url, label: "WhatsApp", Icono: MessageCircle },
  ].filter((red) => esUrlPieValida(red.url));

  return (
    <div className="Footer">
      <div className="footer-columns">
        <div className="footer-info">
          <h2>{pie.marca}</h2>
          <span className="footer-divider"></span>
          {redes.length > 0 && (
            <div className="footer-social">
              {redes.map(({ url, label, Icono }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icono size={20} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="footer-info">
          <h2>Categoría</h2>
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoriaProductos?slug=${encodeURIComponent(cat.slug)}`}
            >
              {cat.nombre}
            </Link>
          ))}
        </div>

        {informacion.length > 0 && (
          <div className="footer-info">
            <h2>{pie.titulo_informacion}</h2>
            {informacion.map((enlace) => (
              <EnlaceFooter
                key={`${enlace.etiqueta}-${enlace.url}`}
                enlace={enlace}
              />
            ))}
          </div>
        )}

        {ayuda.length > 0 && (
          <div className="footer-info">
            <h2>{pie.titulo_ayuda}</h2>
            {ayuda.map((enlace) => (
              <EnlaceFooter
                key={`${enlace.etiqueta}-${enlace.url}`}
                enlace={enlace}
              />
            ))}
          </div>
        )}
      </div>

      <div className="footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} {pie.marca}
          {pie.copyright ? `. ${pie.copyright}` : ""}
        </span>
        <span>{pie.mensaje}</span>
      </div>
    </div>
  );
}

export default Footer;
