import {
    WiDaySunny,
    WiCloud,
    WiRain,
    WiSnow,
    WiThunderstorm,
    WiFog,
} from "react-icons/wi";


// Función que traduce weathercode a íconos
export const getWeatherIcon = (code: number) => {
    if (code === 0) return <WiDaySunny />;
    if ([1, 2, 3].includes(code)) return <WiCloud />;
    if ([45, 48].includes(code)) return <WiFog />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <WiRain />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <WiSnow />;
    if ([95, 96, 99].includes(code)) return <WiThunderstorm />;
    return <WiCloud />;
};
