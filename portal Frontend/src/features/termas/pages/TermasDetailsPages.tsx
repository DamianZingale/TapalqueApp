import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTermaById, Terma } from '../../../services/fetchTermas';
import { Carrusel } from '../../../shared/components/Carrusel';
import { WhatsAppButton } from '../../../shared/components/WhatsAppButton';
import { FaFacebook, FaInstagram, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

export default function TermasDetailPage({
  idDefault,
}: {
  idDefault?: string;
}) {
  const { id } = useParams();
  const [data, setData] = useState<Terma | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarTerma = async () => {
      const termaId = id ?? idDefault;
      if (termaId) {
        setLoading(true);
        const terma = await fetchTermaById(termaId);
        setData(terma);
        setLoading(false);
      }
    };
    cargarTerma();
  }, [id, idDefault]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-center py-5">Termas no encontradas</p>;

  // Convertir imágenes al formato esperado
  const imagenes = data.imagenes?.map((img) => img.imagenUrl) || [];

  return (
    <div className="container my-4">
      <title>{data.titulo} | Termas de Tapalqué App</title>
      <meta name="description" content={`${data.description || 'Las Termas de Tapalqué, principal atractivo turístico de la ciudad.'}${data.horario ? ` Horarios: ${data.horario}.` : ''}`} />
      <link rel="canonical" href="https://tapalqueapp.com.ar/termas" />
      <h1 className="text-center mb-3">{data.titulo}</h1>

      {/* Carrusel de imágenes */}
      <Carrusel images={imagenes} />

      {/* Redes sociales y sitio web */}
      <div className="d-flex justify-content-center gap-4 my-4">
        {data.facebook && (
          <a
            href={data.facebook.startsWith('http') ? data.facebook : `https://facebook.com/${data.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
          >
            <FaFacebook size={32} color="#1877F2" />
          </a>
        )}
        {data.instagram && (
          <a
            href={data.instagram.startsWith('http') ? data.instagram : `https://instagram.com/${data.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
          >
            <FaInstagram size={32} color="#E4405F" />
          </a>
        )}
        <a
          href="https://termastapalque.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          title="Sitio Web Oficial"
          className="d-flex align-items-center gap-2 text-decoration-none"
        >
          <FaGlobe size={32} color="#4CAF50" />
          <span style={{ color: "#4CAF50" }}>Ver web oficial</span>
        </a>
      </div>

      {/* Descripción */}
      <p className="lead text-center">{data.description}</p>

      {/* Horarios */}
      <div className="text-center my-3">
        <strong>Horarios:</strong> {data.horario}
      </div>

      {/* Botón Cómo Llegar */}
      {data.latitud && data.longitud && (
        <div className="text-center my-4">
          <a
            href={`https://www.google.com/maps?q=${data.latitud},${data.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-[11rem] h-[2rem] bg-green text-black rounded-3xl text-[1rem] cursor-pointer flex justify-center items-center transition-all duration-300 hover:bg-[#333]"
          >
            <FaMapMarkerAlt size={18} color="#E53935" className="me-2" />
            Cómo Llegar
          </a>
        </div>
      )}

      {/* BTN teléfono/contacto */}
      {data.telefono && <WhatsAppButton num={data.telefono} />}
    </div>
  );
}
