import Image from "next/image"
import "./nav.css";


function Nav(){
  return(
    <div className="nav-background">
        <div className="nav-fondo">
            <Image src="/fondo.jpg" alt="marca img" width={50} height={50}/>
        </div>
      

      <div className="nav-barra">
        <div className="nav-link">
        <a href="">Inicio</a>
        <a href="">Categoria</a>
        <a href="">Marcas</a>
        <a href="">Contactos</a>
        </div>

      <div className= "nav-menu">
        <input placeholder="Buscar"></input>
        <i>persona</i>
        <i>corazon</i>
        <i>correo</i>
      </div>

      </div>
      

      <div className="nav-titulo">
        <h1>Marked</h1>
        <h3>Tienda online</h3>
      </div>
    </div>
  );
}

export default Nav
