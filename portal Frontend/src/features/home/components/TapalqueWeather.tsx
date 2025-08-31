import { getWeatherIcon } from "../../../shared/utils/weatherIcons";
import { useWeather } from "../api/useWeather";

const TapalqueWeather: React.FC = () => {
    const { current, daily, loading } = useWeather();

    if (loading) return <p>Cargando clima…</p>;

    return (
            <div className="card text-center shadow-lg p-3 mb-5 bg-light rounded my-4">
                <div className="card-body">
                    <h2 className="card-title">Clima en Tapalqué</h2>
                {/* Clima actual */}
                    {current && (
                        <div className="my-3">
                            <div className="display-1">{getWeatherIcon(current.weathercode)}</div>
                            <h1 className="display-3 fw-bold">{Math.round(current.temperature)}°C</h1>
                            <p className="mb-1">Viento: {Math.round(current.windspeed)} km/h</p>
                            <p className="mb-0">
                                {new Date(current.time).toLocaleTimeString("es-AR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    )}
                    {/* Pronóstico próximos días */}
                    {daily && (
                        <div className="row mt-4">
                            {daily.time
                                .slice(0, 6)
                                .map((date, i) => ({
                                    date: new Date(date + "T00:00:00"), // parseamos correctamente
                                    min: Math.round(daily.temperature_2m_min[i]),
                                    max: Math.round(daily.temperature_2m_max[i]),
                                    code: Math.round(daily.weathercode[i]),
                                }))
                                .filter((d) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return d.date >= today; // solo mostrar hoy y futuros
                                })
                                .map((d) => (
                                    <div key={d.date.toISOString()} className="col-4 col-md-2 mb-3">
                                        <div className="card bg-light text-dark border-0 shadow-sm">
                                            <div className="card-body p-2">
                                                <p className="fw-bold mb-1">
                                                    {d.date.toLocaleDateString("es-AR", {
                                                        weekday: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                <div style={{ fontSize: "2rem" }}>
                                                    {getWeatherIcon(d.code)}
                                                </div>
                                                <p className="mb-0">
                                                    {d.min}° / {d.max}°
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
    );
};

export default TapalqueWeather;
