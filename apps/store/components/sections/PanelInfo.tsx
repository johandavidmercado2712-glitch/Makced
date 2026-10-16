import { PanelInfoProps } from "../../types/store"
import "./Panel-info.css"

interface PanelInfoExtendedProps extends PanelInfoProps {
  className?: string
}

export default function PanelInfo({ titulo, descripcion, link, image, button }: PanelInfoExtendedProps) {
  return (
    <section
      className="panel-info"
      aria-label={titulo}
      style={{ "--panel-bg": `url(${image})` } as React.CSSProperties}
    >
      <div className="panel-info-detalle">
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
        <a className="panel-info-cta" href={link}>{button}</a>
      </div>
    </section>
  )
}
