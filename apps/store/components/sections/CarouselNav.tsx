"use client"
import "./carouselNav.css"
import { DEFAULT_DISENO } from "@makced/db/diseno"

interface Slide {
  palabra: string
  parrafo: string
  imagen: string
}

export default function CarouselNav({
  slides = DEFAULT_DISENO.banner.slides,
}: {
  slides?: Slide[]
}) {
  const lista = slides.length > 0 ? slides : DEFAULT_DISENO.banner.slides

  return (
    <div className="carousel-nav">
      <div className="carousel-nav-content">
        <div className="text-rotate">
          {lista.map((slide, i) => (
            <span
              key={i}
              className="text-rotate-word"
              style={{ animationDelay: `${i * 4}s` }}
            >
              {slide.palabra}
            </span>
          ))}
        </div>

        <div className="text-rotate-p">
          {lista.map((slide, i) => (
            <p
              key={i}
              className="text-rotate-p-word"
              style={{ animationDelay: `${i * 4}s` }}
            >
              {slide.parrafo}
            </p>
          ))}
        </div>

      </div>

      <div className="carousel-nav-image">
        {lista.map((slide, i) => (
          <img
            key={i}
            src={slide.imagen || DEFAULT_DISENO.banner.slides[i].imagen}
            alt={`Carousel ${i + 1}`}
            style={{ animationDelay: `${i * 4}s` }}
          />
        ))}
      </div>
    </div>
  )
}
