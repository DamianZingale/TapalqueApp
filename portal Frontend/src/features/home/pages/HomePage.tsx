import { CardGridResponsive } from "../components/CardsResponsives";
import { CardTermas } from "../components/CardTermas";
import TapalqueWeather from "../components/TapalqueWeather";
import "../styles/homePage.css"

export const HomePage = () => {
  return (
    <main className="layout">
      <section className="full-width">
        <TapalqueWeather />
      </section>
      <section className="full-width">
        <CardTermas />
      </section>

      <section className="full-width">
        <CardGridResponsive />
      </section>      
    </main>
  );
};