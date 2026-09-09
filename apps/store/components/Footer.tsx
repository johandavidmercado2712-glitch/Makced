import { Globe, Camera, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import "./footer.css";

function Footer (){
    return(
        <div className="Footer">
            <div className="footer-info">
                <h2>KICKZONE</h2>
                <span>--------</span>
                <div className="footer-social">
                    <Globe size={20} />
                    <Camera size={20} />
                    <MessageCircle size={20} />
                </div>
            </div>

             <div className="footer-info">
                <h2>Categoria</h2>
                <span>Hombre</span>
                <span>Mujer</span>
                <span>Deportivo</span>
                <span>Running</span>
            </div>

             <div className="footer-info">
                <h2>INFORMACION</h2>
                <span>Nosotros</span>
                <span>Terminos y Condiciones</span>
                <span>Politica</span>
            </div>

             <div className="footer-info">
                <h2>AYUDA</h2>
                <span><Mail size={14} /> Contacto</span>
                <span><Phone size={14} /> Envios</span>
                <span><MapPin size={14} /> Metodos de Pago</span>
            </div>

        </div>
    )
}
export default Footer