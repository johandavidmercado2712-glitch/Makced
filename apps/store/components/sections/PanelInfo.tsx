import Link from "next/link"
import { PanelInfoProps } from "../../types/store"
import "./Panel-info.css"

interface PanelInfoExtendedProps extends PanelInfoProps {
  className?: string
}

export default function PanelInfo({ titulo, descripcion, link, image, button }: PanelInfoExtendedProps) {
  const enlace = link?.trim()
  const mostrarCta = Boolean(enlace && enlace !== "#")
  const esExterno = Boolean(enlace && /^https?:/i.test(enlace))

  return (
    <section
      className="panel-info"
      aria-label={titulo}
      style={{ "--panel-bg": `url(${image})` } as React.CSSProperties}
    >
      <div className="panel-info-detalle">
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
        {mostrarCta &&
          (enlace!.startsWith("/") ? (
            <Link className="panel-info-cta" href={enlace!}>
              {button}
            </Link>
          ) : (
            <a
              className="panel-info-cta"
              href={enlace!}
              {...(esExterno
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {button}
            </a>
          ))}
      </div>
    </section>
  )
}
