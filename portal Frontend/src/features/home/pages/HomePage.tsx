import { CardGridResponsive } from "../components/CardsResponsives"
import { CardTermas } from "../components/CardTermas"
import TapalqueWeather from "../components/TapalqueWeather";

export const HomePage = () => {
  return (
    <div className="container">
      <title>Tapalqué App | Gastronomía, Hospedaje, Comercios y más</title>
      <meta name="description" content="Plataforma digital de Tapalqué. Encontrá restaurantes, hoteles, comercios, eventos, termas y servicios de la ciudad. Reservá y pedí online." />
      <link rel="canonical" href="https://tapalqueapp.com.ar/" />
      <div className="row justify-content-center mb-4">
        <div className="col-12 col-sm-10 col-md-10 col-lg-12">
          <CardTermas />
        </div>
      </div>
      <CardGridResponsive />
      <TapalqueWeather/>
    </div>
  );
};