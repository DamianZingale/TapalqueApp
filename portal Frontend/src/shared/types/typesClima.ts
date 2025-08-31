export interface CurrentWeather {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
}

export interface DailyWeather {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
}

export interface WeatherResponse {
    current_weather: CurrentWeather;
    daily: DailyWeather;
}