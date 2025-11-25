import { useEffect, useState } from "react";
import { EventoCard } from "../components/EventoCard";
import type { EventoDTO } from "../types/EventoDTO";
import { Loading } from "../../../shared/components/Loading";
import styles from "../../../shared/styles/listPages.module.css";

export default function EventosListPage() {
    const [eventos, setEventos] = useState<EventoDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /*MOCK TEMPORAL*/
        const mockData: EventoDTO[] = [
    {
        id_evento: 1,
        nombre_evento: "Cantobar en la Clandestina",
        fecha: "2025-11-25", // hoy
        hora: "21:00",
        lugar: "La clandestina",
        descripcion: "Hoy el Chua Santos en la Clandestina a las 21hs.",
        image: "/eventos/festival.jpg",
        },
        {
        id_evento: 2,
        nombre_evento: "Festival Tapalqué",
        fecha: "2025-11-28", // futuro
        hora: "18:00",
        lugar: "Parque Central",
        descripcion: "Festival con música y gastronomía local",
        image: "/eventos/festival2.jpg",
        telefono: "5491122334455",
        },
        {
        id_evento: 3,
        nombre_evento: "Peña Folklórica",
        fecha: "2025-11-20", // pasado
        hora: "20:00",
        lugar: "Centro Cultural",
        descripcion: "Peña con artistas locales",
        image: "/eventos/folklore.jpg",
        telefono: "5491122334455",
        },
    ];

    const ahora = new Date();

    const eventosFiltrados = mockData
        .filter((evento) => {
        const fechaEvento = new Date(`${evento.fecha}T${evento.hora}`);
        console.log("Evento:", evento, "Fecha construida:", fechaEvento);
        return fechaEvento > ahora;
        })
        .sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaA.getTime() - fechaB.getTime();
        });

    setEventos(eventosFiltrados);
    setLoading(false);

        /*
        const fetchEventos = async () => {
        try {
            const res = await fetch("http://localhost:8081/api/eventos/findAll");
            if (!res.ok) throw new Error("Error al obtener los eventos");
            const data: EventoDTO[] = await res.json();

            const ahora = new Date();

            const eventosFiltrados = data
            .filter((evento) => {
                const fechaEvento = new Date(`${evento.fecha}T${evento.hora}`);
                console.log("Evento:", evento, "Fecha construida:", fechaEvento);
                return fechaEvento > ahora;
            })
            .sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA.getTime() - fechaB.getTime();
            });

            setEventos(eventosFiltrados);
        } catch (error) {
            console.error("Error:", error);
            setEventos([]);
        } finally {
            setLoading(false);
        }
        };

        fetchEventos();*/
    }, []);

    if (loading) return <Loading text="Cargando eventos..." />;

    return (
        <div className={styles.layout}>
        <h1 className={styles.tittle}>Eventos</h1>
        <div className={styles.layoutBox}>
            {eventos.length > 0 ? (
            eventos.map((evento) => (
                <EventoCard
                key={evento.id_evento}
                titulo={evento.nombre_evento}
                descripcion={evento.descripcion}
                fecha={evento.fecha}
                hora={evento.hora}
                lugar={evento.lugar}
                imagenUrl={evento.image}
                telefono={evento.telefono}
                />
            ))
            ) : (
            <p>No hay eventos disponibles</p>
            )}
        </div>
        </div>
    );
}