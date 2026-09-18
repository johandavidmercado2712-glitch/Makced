import Image from "next/image"
import { Star } from "lucide-react"
import { PanelInfoProps } from "../types/store"
import "./Panel-info.css"

interface PanelInfoExtendedProps extends PanelInfoProps {
  className?: string
}

export default function PanelInfo({ titulo, descripcion, link, image, button }: PanelInfoExtendedProps) {
  return (
    <div 
      className="panel-info"
      style={{ "--panel-bg": `url(${image})` } as React.CSSProperties}
    >
      <div className="panel-info-detalle">
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
        <a href={link}>
          <button>{button}</button>
        </a>
      </div>
    </div>
  )
}
