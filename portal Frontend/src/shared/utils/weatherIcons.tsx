
export const getEmojiWeather = (code: number): { emoji: string; label: string } => {
    if ([0, 1].includes(code)) return { emoji: "☀️", label: "Soleado" };
    if ([2].includes(code)) return { emoji: "🌤️", label: "Parcialmente nublado" };
    if ([3].includes(code)) return { emoji: "☁️", label: "Nublado" };
    if ([45, 48].includes(code)) return { emoji: "🌫️", label: "Neblina" };
    if ([51, 61].includes(code)) return { emoji: "🌦️", label: "Lluvia ligera" };
    if ([63, 65].includes(code)) return { emoji: "🌧️", label: "Lluvia fuerte" };
    if ([71, 73, 75].includes(code)) return { emoji: "❄️", label: "Nieve" };
    if ([95, 96, 99].includes(code)) return { emoji: "⛈️", label: "Tormenta" };
    return { emoji: "❓", label: "Desconocido" };
};


