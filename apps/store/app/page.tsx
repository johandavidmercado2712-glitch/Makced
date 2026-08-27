import Nav from "@makced/ui/Nav"
import Footer from "@makced/ui/Footer"
import Image from "next/image"

export default function Page(){
  return(
    <>
      <Nav />
      <div className="Carrucel">
        <div className="Carrucel-card">
          <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
        </div>
        <div className="Carrucel-card">
          <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
        </div>
        <div className="Carrucel-card">
          <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
        </div>
        <div className="Carrucel-card">
          <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
        </div>
        <div className="Carrucel-card">
          <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
        </div>

      </div >

      <div className="categoria">
        <div className="categoria-titulo">
          <h1>CATEGORIAS</h1>
        </div>
        <div className="categoria-cards">
          <div className="categoria-card">
            <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
            <h3>hombre</h3>
            </div>
            <div className="categoria-card">
              <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
              <h3>Mujer</h3>
            </div>
            <div className="categoria-card">
              <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
              <h3>Deportivo</h3>
            </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
