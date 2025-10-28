import { CardSecciones } from "./CardSecciones";

export const CardGridResponsive = () => {
    const cards = [
        { titulo: "Comercios", imagenUrl: "https://a1noticias.com.ar/08-2020/resize_1596585742.jpg", destino: "/comercio" },
        { titulo: "Gastronomia", imagenUrl: "https://media.istockphoto.com/id/1350197620/es/foto/comida-espa%C3%B1ola.jpg?s=612x612&w=0&k=20&c=xuhPNhV56luoGi61mDiFMk1Syp_LZ6WJIkcTuI5Et9U=" , destino: "/gastronomia" },
        { titulo: "Hospedajes", imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-XaKNy61DeD4q2ft5nl4Gs3q88NYnubCksxa0WMCFrtUoG7aM-p1QcoPQA770S_c2Kds&usqp=CAU" , destino: "/hospedaje" },
        { titulo: "Servicios", imagenUrl: "https://media.istockphoto.com/id/513445601/es/foto/grupo-multi%C3%A9tnico-diversas-personas-con-diferentes-puestos-de-trabajo.jpg?s=612x612&w=0&k=20&c=3QV_HokhvMlIRDmxHI7SRe2C3MW-MosPbMzNpKcN1zM=" , destino: "/servicios" },
        { titulo: "Espacios Publicos", imagenUrl: "https://termastapalque.com.ar/wp-content/uploads/2023/09/088.webp" , destino: "/espublicos" },
    ];

        return (
            <div className="">
            {cards.map((card, index) => (
                <div key={index} className="">
                <CardSecciones {...card} />
                </div>
            ))}
            </div>
        );

};
