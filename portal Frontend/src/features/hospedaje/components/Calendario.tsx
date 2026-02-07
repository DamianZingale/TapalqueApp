// components/Calendario.tsx
import { es } from 'date-fns/locale';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CalendarioProps {
  idHabitacion: string;
  fechasReservadas?: string[]; // "YYYY-MM-DD"
  onAgregarReserva?: (idHabitacion: string, start: Date, end: Date) => void;
  onDateChange?: (start: Date | null, end: Date | null) => void;
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const Calendario = ({
  idHabitacion,
  fechasReservadas = [],
  onAgregarReserva,
  onDateChange,
}: CalendarioProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fechasBloqueadas = fechasReservadas.map((f) => {
    const [y, m, d] = f.split('-').map(Number);
    return new Date(y, m - 1, d);
  });

  const handleClickAgregar = () => {
    if (!startDate || !endDate) {
      alert('Seleccioná un rango válido (inicio y fin).');
      return;
    }

    if (typeof onAgregarReserva !== 'function') {
      console.error(
        'Calendario: onAgregarReserva no es una función',
        onAgregarReserva
      );
      alert('Error interno: callback de reserva no definido. Revisá el padre.');
      return;
    }

    onAgregarReserva(idHabitacion, startDate, endDate);
    setStartDate(null);
    setEndDate(null);
  };

  const formatFecha = (date: Date) =>
    date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const calcNoches = () => {
    if (!startDate || !endDate) return 0;
    return Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="calendario-custom" style={{ maxWidth: 360, margin: '0 auto' }}>
      <div
        className="card shadow border-0"
        style={{ borderRadius: 14, overflow: 'hidden' }}
      >
        {/* Calendario inline */}
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(dates) => {
            const [start, end] = dates as [Date | null, Date | null];
            setStartDate(start);
            setEndDate(end);
            onDateChange?.(start, end);
          }}
          dayClassName={(date) => {
            const isReserved = fechasBloqueadas.some(
              (d) => d.toDateString() === date.toDateString()
            );
            return isReserved ? 'dia-reservado' : '';
          }}
          inline
          locale={es}
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="d-flex align-items-center justify-content-between">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="btn border-0 text-white p-0"
                style={{
                  fontSize: '1.4rem',
                  lineHeight: 1,
                  opacity: prevMonthButtonDisabled ? 0.4 : 1,
                  cursor: prevMonthButtonDisabled ? 'default' : 'pointer',
                }}
              >
                ‹
              </button>
              <span
                className="text-white fw-semibold"
                style={{ fontSize: '0.95rem' }}
              >
                {MESES[date.getMonth()]} {date.getFullYear()}
              </span>
              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="btn border-0 text-white p-0"
                style={{
                  fontSize: '1.4rem',
                  lineHeight: 1,
                  opacity: nextMonthButtonDisabled ? 0.4 : 1,
                  cursor: nextMonthButtonDisabled ? 'default' : 'pointer',
                }}
              >
                ›
              </button>
            </div>
          )}
        />

        {/* Leyenda */}
        <div className="border-top py-2 d-flex justify-content-center gap-4">
          <span className="d-flex align-items-center gap-1">
            <span className="dia-leyenda dia-leyenda--seleccionado" />
            <small className="text-muted">Seleccionado</small>
          </span>
          <span className="d-flex align-items-center gap-1">
            <span className="dia-leyenda dia-leyenda--rango" />
            <small className="text-muted">Rango</small>
          </span>
          <span className="d-flex align-items-center gap-1">
            <span className="dia-leyenda dia-leyenda--ocupada" />
            <small className="text-muted">Ocupada</small>
          </span>
        </div>

        {/* Resumen de fechas seleccionadas */}
        {startDate && (
          <div className="border-top py-3 px-3">
            <div className="row g-0 text-center">
              <div className="col-5">
                <small className="text-muted d-block">Entrada</small>
                <small className="text-primary fw-bold">
                  {formatFecha(startDate)}
                </small>
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center text-muted">
                →
              </div>
              <div className="col-5">
                <small className="text-muted d-block">Salida</small>
                <small className="text-primary fw-bold">
                  {endDate ? formatFecha(endDate) : '—'}
                </small>
              </div>
            </div>
            {endDate && (
              <p className="text-center mb-0 mt-2">
                <span className="badge bg-primary rounded-pill">
                  {calcNoches()} noches
                </span>
              </p>
            )}
          </div>
        )}

        {/* Botón agregar reserva */}
        <div className="p-3 pt-2">
          <button
            className="btn btn-primary w-100 fw-semibold"
            style={{ borderRadius: 8, padding: '11px 0' }}
            onClick={handleClickAgregar}
          >
            Agregar reserva
          </button>
        </div>
      </div>
    </div>
  );
};
