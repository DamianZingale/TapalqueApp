interface DaySchedule {
  day: number; // 1=Lunes, 2=Martes, ..., 7=Domingo
  open: string; // "09:00"
  close: string; // "22:00"
}

/**
 * Parsea el formato de schedule del backend
 * Formato: "1:09:00-22:00; 2:09:00-22:00; 3:09:00-22:00"
 *
 * Días: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
 */
export function parseSchedule(schedule: string): DaySchedule[] {
  if (!schedule) return [];

  try {
    const days = schedule.split(';').map((s) => s.trim());
    const schedules: DaySchedule[] = [];

    for (const dayStr of days) {
      // Formato: "1:09:00-22:00"
      const [dayPart, timePart] = dayStr.split(':');
      const day = parseInt(dayPart);

      if (!timePart) continue;

      // Extraer horas de apertura y cierre
      const times = timePart.split('-');
      if (times.length !== 2) continue;

      const [openTime, closeTime] = times;

      schedules.push({
        day,
        open: openTime.trim(),
        close: closeTime.trim(),
      });
    }

    return schedules;
  } catch (error) {
    console.error('Error parsing schedule:', error);
    return [];
  }
}

/**
 * Convierte día de JavaScript (0=Domingo) a formato backend (1=Lunes)
 */
function convertJsDayToBackendDay(jsDay: number): number {
  // JS: 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
  // Backend: 1=Lunes, 2=Martes, ..., 6=Sábado, 7=Domingo
  if (jsDay === 0) return 7; // Domingo
  return jsDay;
}

/**
 * Verifica si el local está abierto en este momento
 */
export function isOpenNow(schedule: string): boolean {
  if (!schedule) return false;

  const schedules = parseSchedule(schedule);
  if (schedules.length === 0) return false;

  const now = new Date();
  const currentDay = convertJsDayToBackendDay(now.getDay());
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  // Buscar el horario de hoy
  const todaySchedule = schedules.find((s) => s.day === currentDay);

  if (!todaySchedule) return false;

  // Comparar horarios
  return (
    currentTime >= todaySchedule.open && currentTime <= todaySchedule.close
  );
}

/**
 * Obtiene el horario de hoy en formato legible
 */
export function getTodaySchedule(schedule: string): string | null {
  if (!schedule) return null;

  const schedules = parseSchedule(schedule);
  const now = new Date();
  const currentDay = convertJsDayToBackendDay(now.getDay());

  const todaySchedule = schedules.find((s) => s.day === currentDay);

  if (!todaySchedule) return 'Cerrado hoy';

  return `${todaySchedule.open} - ${todaySchedule.close}`;
}

/**
 * Obtiene todos los horarios en formato legible
 */
export function getFullSchedule(
  schedule: string
): { day: string; hours: string }[] {
  if (!schedule) return [];

  const schedules = parseSchedule(schedule);
  const dayNames = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  return schedules.map((s) => ({
    day: dayNames[s.day - 1] || 'Desconocido',
    hours: `${s.open} - ${s.close}`,
  }));
}

/**
 * Obtiene el estado en texto legible
 */
export function getStatusText(schedule: string): {
  text: string;
  isOpen: boolean;
} {
  const open = isOpenNow(schedule);
  const todaySchedule = getTodaySchedule(schedule);

  if (open) {
    return {
      text: 'Abierto ahora',
      isOpen: true,
    };
  }

  if (todaySchedule && todaySchedule !== 'Cerrado hoy') {
    return {
      text: `Cerrado • Abre a las ${todaySchedule.split(' - ')[0]}`,
      isOpen: false,
    };
  }

  return {
    text: 'Cerrado',
    isOpen: false,
  };
}
