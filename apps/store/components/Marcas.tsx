import "./marcas.css"
import Image from "next/image"

export default function Marcas(){
    return(
        <div className="product-cards">
            .
            <div className="product-card">
                <Image src="/marca-1.jpg" alt="marca img" width={200} height={200}/>
            </div>
            <div className="product-card">
                <Image src="/marca-2.jpg" alt="marca img" width={200} height={200}/>
            </div>
            <div className="product-card">
                <Image src="/marca-3.jpg" alt="marca img" width={200} height={200}/>
            </div>
            <div className="product-card">
                <Image src="/marca-4.jpg" alt="marca img" width={200} height={200}/>
            </div>
            <div className="product-card">
                <Image src="/marca-5.jpg" alt="marca img" width={200} height={200}/>
            </div>
            <div className="product-card">
                <Image src="/marca-6.jpg" alt="marca img" width={200} height={200}/>
            </div>
        </div>
    )
    
}