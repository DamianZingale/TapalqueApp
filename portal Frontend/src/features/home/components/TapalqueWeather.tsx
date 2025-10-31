import { Loading } from "../../../shared/components/Loading";
import { getEmojiWeather  } from "../../../shared/utils/weatherIcons";
import { useWeather } from "../api/useWeather";
import styles from "../styles/weather.module.css";


const TapalqueWeather: React.FC = () => {
    const { current, daily, loading } = useWeather();

    if (loading) return <Loading text="Cargando el clima de Tapalqué…" />;

    return (
        <div className={styles.weatherCard}>
        <h2 className={styles.weatherTitle}>Clima en Tapalqué</h2>

        {current && (
            <div className={styles.weatherCurrent}>
            {(() => {
                const { emoji, label } = getEmojiWeather(current.weathercode);
                return (
                <div className={styles.weatherIcon} title={label}>
                    {emoji}
                </div>
                );
            })()}
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
            <div className={styles.weatherForecast}>
            {daily.time.slice(0, 6).map((date, i) => {
                const d = new Date(date + "T00:00:00");
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (d < today) return null;

                const { emoji, label } = getEmojiWeather(daily.weathercode[i]);

                return (
                <div key={d.toISOString()} className={styles.forecastDay}>
                    <p>
                    {d.toLocaleDateString("es-AR", {
                        weekday: "short",
                        day: "numeric",
                    })}
                    </p>
                    <div className={styles.forecastIcon} title={label}>
                    {emoji}
                    </div>
                    <p>
                    {Math.round(daily.temperature_2m_min[i])}° /{" "}
                    {Math.round(daily.temperature_2m_max[i])}°
                    </p>
                </div>
                );
            })}
            </div>
        )}
        </div>
    );
};

export default TapalqueWeather;
