import { CardSecciones } from "./CardSecciones";

export const CardGridResponsive = () => {
    const cards = [
        { titulo: "Comercios", imagenUrl: undefined, categoria: "comercio" as const, destino: "/comercio" },
        { titulo: "Gastronomia", imagenUrl: undefined, categoria: "gastronomia" as const, destino: "/gastronomia" },
        { titulo: "Hospedajes", imagenUrl: undefined, categoria: "hospedaje" as const, destino: "/hospedaje" },
        { titulo: "Servicios", imagenUrl: undefined, categoria: "servicios" as const, destino: "/servicios" },
        { titulo: "Espacios Publicos", imagenUrl: "https://termastapalque.com.ar/wp-content/uploads/2023/09/088.webp", categoria: "espacios" as const, destino: "/espublicos" },
        { titulo: "Eventos", imagenUrl: undefined, categoria: "eventos" as const, destino: "/eventos" },
    ];

    return (
            <div className="row justify-content-center g-4 ">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="col-12 col-sm-6 col-md-5 col-lg-4 "
                    >
                        <CardSecciones
                            titulo={card.titulo}
                            imagenUrl={card.imagenUrl}
                            destino={card.destino}
                            categoria={card.categoria}
                        />
                    </div>
                ))}
            </div>
    );
};

