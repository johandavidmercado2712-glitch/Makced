import { Globe, Camera, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import type { ConfigDiseno } from "@makced/db/diseno";
import "./footer.css";

interface FooterProps {
  categorias?: { id: string; nombre: string; slug: string }[];
  pie: ConfigDiseno["pie"];
}

function Footer ({ categorias = [], pie }: FooterProps) {
    return(
        <div className="Footer">
            <div className="footer-columns">
                <div className="footer-info">
                    <h2>{pie.marca}</h2>
                    <span className="footer-divider"></span>
                    <div className="footer-social">
                        <Globe size={20} />
                        <Camera size={20} />
                        <MessageCircle size={20} />
                    </div>
                </div>

                <div className="footer-info">
                    <h2>Categoria</h2>
                    {categorias.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/categoriaProductos?slug=${cat.slug}`}
                        >
                            {cat.nombre}
                        </Link>
                    ))}
                </div>

                <div className="footer-info">
                    <h2>INFORMACION</h2>
                    <Link href="#">Nosotros</Link>
                    <Link href="#">Terminos y Condiciones</Link>
                    <Link href="#">Politica</Link>
                </div>

                <div className="footer-info">
                    <h2>AYUDA</h2>
                    <Link href="#"><Mail size={14} /> Contacto</Link>
                    <Link href="#"><Phone size={14} /> Envios</Link>
                    <Link href="#"><MapPin size={14} /> Metodos de Pago</Link>
                </div>
            </div>

            <div className="footer-bottom">
                <span>&copy; {new Date().getFullYear()} {pie.marca}. {pie.copyright}</span>
                <span>{pie.mensaje}</span>
            </div>
        </div>
    )
}
export default Footer
