import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHospedajes } from "../../../services/fetchHospedajes";
import type { Hospedaje } from "../../../services/fetchHospedajes";
import type { Habitacion } from "../../../services/fetchHabitaciones";
import { fetchDisponibilidad } from "../../../services/fetchReservas";

interface HospedajeDisponible {
    hospedaje: Hospedaje;
    habitaciones: Habitacion[];
}

export default function HospedajeListPage() {
    const [hospedajes, setHospedajes] = useState<Hospedaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [buscando, setBuscando] = useState(false);
    // null = no se buscó aún (muestra vista normal), array = resultado de búsqueda
    const [disponibles, setDisponibles] = useState<HospedajeDisponible[] | null>(null);

    useEffect(() => {
        fetchHospedajes()
        .then((data) => setHospedajes(data))
        .catch((err) => {
            console.error("Error al cargar hospedajes:", err);
            setError("No se pudieron cargar los hospedajes.");
        })
        .finally(() => setLoading(false));
    }, []);

    const handleBuscar = async () => {
        if (!desde || !hasta) return;

        setBuscando(true);
        setDisponibles(null);

        try {
            // Una sola llamada por hospedaje: el backend combina habitaciones + reservas
            const resultados = await Promise.all(
                hospedajes.map(async (hospedaje) => {
                    const habitaciones = await fetchDisponibilidad(String(hospedaje.id), desde, hasta);
                    return { hospedaje, habitaciones };
                })
            );

            setDisponibles(resultados.filter((r) => r.habitaciones.length > 0));
        } catch (err) {
            console.error("Error buscando disponibilidad:", err);
            setError("Error al buscar disponibilidad.");
        } finally {
            setBuscando(false);
        }
    };

    const handleLimpiar = () => {
        setDesde("");
        setHasta("");
        setDisponibles(null);
    };

    const handleCardClick = (hospedaje: Hospedaje) => {
        navigate(`/hospedaje/${hospedaje.id}`, {
            state: { hospedaje },
        });
    };

    if (loading) return <p className="text-center my-5">Cargando hospedajes...</p>;
    if (error) return <p className="text-center text-danger my-5">{error}</p>;

    const fechasInvalidas = desde && hasta && desde >= hasta;

    return (
        <div className="container">
        <title>Hospedajes en Tapalqué | Hoteles, Cabañas y más</title>
        <meta name="description" content="Reservá tu estadía en Tapalqué. Hoteles, departamentos, cabañas y casas disponibles. Buscá por disponibilidad de fechas." />
        <link rel="canonical" href="https://tapalqueapp.com.ar/hospedaje" />
        <h1 className="text-center my-4">Hospedajes</h1>

        {/* Filtro de disponibilidad por fechas */}
        <div className="card mb-4 shadow-sm">
            <div className="card-body">
                <div className="row align-items-end g-3">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Desde</label>
                        <input
                            type="date"
                            className="form-control"
                            value={desde}
                            onChange={(e) => {
                                setDesde(e.target.value);
                                setDisponibles(null);
                            }}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Hasta</label>
                        <input
                            type="date"
                            className="form-control"
                            value={hasta}
                            min={desde || undefined}
                            onChange={(e) => {
                                setHasta(e.target.value);
                                setDisponibles(null);
                            }}
                        />
                    </div>
                    <div className="col-md-3 d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={handleBuscar}
                            disabled={!desde || !hasta || buscando || !!fechasInvalidas}
                        >
                            {buscando ? "Buscando..." : "Buscar disponibles"}
                        </button>
                        {(desde || hasta || disponibles) && (
                            <button className="btn btn-outline-secondary" onClick={handleLimpiar}>
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>
                {fechasInvalidas && (
                    <p className="text-danger mt-2 mb-0 small">
                        La fecha "Hasta" debe ser posterior a "Desde".
                    </p>
                )}
            </div>
        </div>

        {/* Resultados filtrados por fechas */}
        {disponibles !== null ? (
            <>
                <p className="text-muted text-center">
                    {disponibles.length > 0
                        ? `${disponibles.length} hospedaje${disponibles.length !== 1 ? "s" : ""} con disponibilidad`
                        : "No hay hospedajes disponibles para esas fechas."}
                </p>
                <div className="row justify-content-center">
                    {disponibles.map(({ hospedaje, habitaciones }) => (
                        <div className="col-auto my-2" key={hospedaje.id}>
                            <div className="card h-100 d-flex flex-column" style={{ width: "18rem" }}>
                                <img
                                    src={hospedaje.imagenes?.[0] || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                                    className="card-img-top p-1"
                                    alt={hospedaje.titulo}
                                    style={{ height: "160px", objectFit: "cover" }}
                                />
                                <div className="card-body d-flex flex-column flex-grow-1">
                                    <h5 className="card-title text-center">{hospedaje.titulo}</h5>
                                    {hospedaje.ubicacion && (
                                        <p className="text-center text-muted mb-2 small">{hospedaje.ubicacion}</p>
                                    )}
                                    <div className="text-center mb-2">
                                        <span className="badge bg-success">
                                            {habitaciones.length} habitación{habitaciones.length !== 1 ? "es" : ""} libre
                                        </span>
                                    </div>

                                    {/* Lista de habitaciones libres */}
                                    <div className="border-top pt-2">
                                        {habitaciones.map((hab) => (
                                            <div
                                                key={hab.id}
                                                className="d-flex justify-content-between align-items-center py-1 border-bottom border-light"
                                            >
                                                <div>
                                                    <div className="fw-semibold small">{hab.titulo}</div>
                                                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                                        Hasta {hab.maxPersonas} {hab.maxPersonas === 1 ? "persona" : "personas"}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="text-success fw-bold small">
                                                        ${hab.precio.toLocaleString()}
                                                    </span>
                                                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                                        /{hab.tipoPrecio === "por_habitacion" ? "noche" : "pers./noche"}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-grid gap-2 col-6 mx-auto mt-auto pt-2">
                                        <button
                                            onClick={() => handleCardClick(hospedaje)}
                                            className="btn btn-secondary p-1"
                                        >
                                            Ver más
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        ) : (
            /* Sin búsqueda activa: vista original con cards */
            <div className="row justify-content-center">
                {hospedajes.map((hospedaje) => (
                <Card
                    key={hospedaje.id}
                    id={String(hospedaje.id)}
                    titulo={hospedaje.titulo}
                    imagenUrl={hospedaje.imagenes?.[0] || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                    tipo={SECCION_TYPE.HOSPEDAJES}
                    direccion_local={hospedaje.ubicacion}
                    onClick={() => handleCardClick(hospedaje)}
                />
                ))}
                {hospedajes.length === 0 && (
                    <p className="text-center my-5">No hay hospedajes disponibles por el momento.</p>
                )}
            </div>
        )}
        </div>
    );
}