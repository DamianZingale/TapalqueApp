import { Loading } from "../../../shared/components/Loading";
import { getWeatherIcon } from "../../../shared/utils/weatherIcons";
import { useWeather } from "../api/useWeather";

const TapalqueWeather: React.FC = () => {
    const { current, daily, loading } = useWeather();

    if (loading) return <Loading text="Cargando el clima de Tapalqué…" />;

    return (
        <div className="weather-card">
        <h2>Clima en Tapalqué</h2>

        {current && (
            <div className="weather-current">
            <div className="weather-icon">{getWeatherIcon(current.weathercode)}</div>
            <h1>{Math.round(current.temperature)}°C</h1>
            <p>Viento: {Math.round(current.windspeed)} km/h</p>
            <p>
                {new Date(current.time).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                })}
            </p>
            </div>
        )}

        {daily && (
            <div className="weather-forecast">
            {daily.time.slice(0, 6).map((date, i) => {
                const d = new Date(date + "T00:00:00");
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (d < today) return null;

                return (
                <div key={d.toISOString()} className="forecast-day">
                    <p>{d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })}</p>
                    <div className="forecast-icon">{getWeatherIcon(daily.weathercode[i])}</div>
                    <p>{Math.round(daily.temperature_2m_min[i])}° / {Math.round(daily.temperature_2m_max[i])}°</p>
                </div>
                );
            })}
            </div>
        )}
        </div>
    );
};

export default TapalqueWeather;