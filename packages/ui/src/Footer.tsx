import "./footer.css";

function Footer (){
    return(
        <div className="Footer">
            <div className="footer-info">
                <h2>KICKZONE</h2>
                <span>--------</span>
                <span>--------</span>
                <span>--------</span>
                <span>--------</span>
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
                <span>Contacto</span>
                <span>Envios</span>
                <span>Metodos de Pago</span>
            </div>

        </div>
    )
}
export default Footer