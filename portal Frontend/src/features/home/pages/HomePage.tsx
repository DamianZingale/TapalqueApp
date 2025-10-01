import { CardGridResponsive } from "../components/CardsResponsives"
import { CardTermas } from "../components/CardTermas"
import TapalqueWeather from "../components/TapalqueWeather";

export const HomePage = () => {
  return (
    <div className="container">
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