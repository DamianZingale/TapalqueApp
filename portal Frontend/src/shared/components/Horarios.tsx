import type { HorariosProps } from '../types/PropsGeneralesVerMas';

export const Horarios: React.FC<HorariosProps> = ({ horarios }) => {
  return (
    <p
      style={{
        whiteSpace: 'pre-line',
        textAlign: 'justify',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        color: '#444',
        fontWeight: 400,
        marginBottom: '1.5rem',
      }}
    >
      {<strong>Nuestros horarios:</strong>}
      {'\n'}
      {horarios}
    </p>
  );
};
