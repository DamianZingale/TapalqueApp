import { useEffect, useState } from "react";
import axios from "axios";
import { type CurrentWeather, type DailyWeather, type WeatherResponse } from "../../../shared/types/typesClima";

export const useWeather = () => {
    const [current, setCurrent] = useState<CurrentWeather | null>(null);
    const [daily, setDaily] = useState<DailyWeather | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await axios.get<WeatherResponse>(
                    "https://api.open-meteo.com/v1/forecast",
                    {
                        params: {
                            latitude: -35.385,
                            longitude: -59.584,
                            current_weather: true,
                            daily: "temperature_2m_max,temperature_2m_min,weathercode",
                            timezone: "America/Argentina/Buenos_Aires",
                        },
                    }
                );
                setCurrent(response.data.current_weather);
                setDaily(response.data.daily);
            } catch (err) {
                console.error("Error obteniendo clima:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    return { current, daily, loading };
};