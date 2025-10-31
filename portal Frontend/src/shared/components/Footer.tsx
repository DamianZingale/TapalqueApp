import styles from "../../shared/components/styles/footer.module.css";
import logo from "../../../public/LogoTpqGo.png"; 
import { Link } from "react-router-dom";


export default function Footer() {
    return (
        <footer className={styles.footerContainer}>
        <div className={styles.footerContent}>
            <div className={styles.footerColumn}>
                <img src={logo} alt="TapalquéGO!" className={styles.logo} />
                <div className="">
                    <h2 className={styles.title}>TapalquéGO!</h2>
                    <p className={styles.slogan}>Naturaleza viva</p>
                </div>
            </div>

            <div className={styles.footerColumnMiddle}>
            <h4>Enlaces rápidos</h4>
            <ul>
                <li><Link to="/termas">Termas</Link></li>
                <li><Link to="/gastronomia">Gastronomía</Link></li>
                <li><Link to="/hospedajes">Hospedajes</Link></li>
                <li><Link to="/comercios">Comercios</Link></li>
            </ul>
            </div>

            <div className={styles.footerColumnMiddle}>
            <h4>Contacto</h4>
            <p>📞 1234-5678</p>
            <p>📧 info@tapalque.com</p>
            <p>📍 Tapalqué</p>
            </div>
        </div>

        <div className={styles.footerBottom}>
        <small>
            Desarrollado por{" "}
            <a
            href="https://www.linkedin.com/in/damian-zingale-7a89bb114/"
            target="_blank"
            rel="noopener noreferrer"
            >
            Damian
            </a>
            ,{" "}
            <a
            href="https://www.linkedin.com/in/santiago-lamot-/"
            target="_blank"
            rel="noopener noreferrer"
            >
            Santiago
            </a>{" "}
            y{" "}
            <a
            href="https://www.linkedin.com/in/nahuelncejas?"
            target="_blank"
            rel="noopener noreferrer"
            >
            Nahuel
            </a>
        </small>
        <br />
        <small>&copy; {new Date().getFullYear()} TapalquéGO! - Todos los derechos reservados.</small>
        </div>

        </footer>
    );
}