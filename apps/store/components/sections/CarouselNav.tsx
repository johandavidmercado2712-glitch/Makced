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
    <section className="carousel-nav" aria-label="Presentación de la tienda">
      <div className="carousel-nav-content">
        <h1 className="text-rotate" aria-label={lista[0].palabra}>
          {lista.map((slide, i) => (
            <span
              key={slide.palabra}
              className="text-rotate-word"
              style={{ animationDelay: `${i * 4}s` }}
            >
              {slide.palabra}
            </span>
          ))}
        </h1>

        <div className="text-rotate-p">
          {lista.map((slide, i) => (
            <p
              key={slide.palabra}
              className="text-rotate-p-word"
              style={{ animationDelay: `${i * 4}s` }}
            >
              {slide.parrafo}
            </p>
          ))}
        </div>

      </div>

      <div className="carousel-nav-image" aria-hidden="true">
        {lista.map((slide, i) => (
          <img
            key={slide.palabra}
            src={slide.imagen || DEFAULT_DISENO.banner.slides[i].imagen}
            alt=""
            style={{ animationDelay: `${i * 4}s` }}
          />
        ))}
      </div>
    </section>
  )
}
