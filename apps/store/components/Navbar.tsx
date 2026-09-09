import Image from "next/image";
import { User, Search, Heart, Sparkles, ShoppingCart } from "lucide-react";
import "./navbar.css";

export default function Navbar() {
  return (
    <div className="nav-main">
      <div className="nav-icon">
        <a href="#">
          <i><User size={34} /></i>
        </a>
        <h2>MAKCED</h2>
        <a href="">
          <i><Search size={34} /></i>
          <i><Heart size={34} /></i>
          <i><ShoppingCart size={34} /></i>
        </a>
      </div>


      <div className="nav-sessiones">
        <div className="nav-session">
          <a href="">Inicio</a>
          <a href="">Hombres</a>
          <a href="">Mujeres</a>
          <a href="">Niños</a>
          <a href="">Novedades</a>
          <a href="">Marcas</a>
        </div>
      </div>
    </div>
  );
}
