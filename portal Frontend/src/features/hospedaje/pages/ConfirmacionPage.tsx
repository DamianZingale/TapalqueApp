import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { ButtonMercadoPago } from "../../../shared/components/ButtonMercadoPago";
import { Loading } from "../../../shared/components/Loading";

export const ConfirmacionPage = () => {
    const location = useLocation();
    const { id, idOpcion, fecha } = location.state || {};
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        //Falta tarer datos del backend
        const d = {
            titulo: "Habitación privada en pleno centro",
            urlImagen: "https://a0.muscache.com/im/pictures/miso/Hosting-565612064347694238/original/f685d3cf-ec05-4d23-8925-950600e42536.png?im_w=1200",
            descipcion: "maximo 5 personas",
            precio: "50.000",
            preferenceId: "50.123456789-abcdefg-xyz"
        };
        setData(d);
        setLoading(false)
    }, [])


    if (loading) {
        return <Loading text="Cargando locales..." />
    }

    return (

        <div className="container text-center">
            <Title text={data.titulo} />
            <Carrusel images={[data.urlImagen]} />
            <p>Fecha: {fecha}</p>
            <p>descripcion: {data.descipcion}</p>
            <ButtonMercadoPago preferenceId={data.preferenceId} />
        </div>
    )
}