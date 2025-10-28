import { CardGridResponsive } from "../components/CardsResponsives";
import { CardTermas } from "../components/CardTermas";
import TapalqueWeather from "../components/TapalqueWeather";
import "../styles/homePage.css"

export const HomePage = () => {
  return (
    <main className="layout">
      <section className="">
        <TapalqueWeather />
      </section>
      <section className="">
        <CardTermas />
      </section>

      <section className="">
        <CardGridResponsive />
      </section>      
    </main>
  );
};