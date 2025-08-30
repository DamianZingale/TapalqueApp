import { Card } from "../../../shared/components/Card";

export default function ComercioListPage() {
    return (
        <div className="container">
            <h1 className="text-center my-4">Comercios</h1>
            <div className="row justify-content-center">
                <Card
                    id="cordoba-123"
                    titulo="Hospedaje en Córdoba"
                    imagenUrl="https://ejemplo.com/img/cordoba.jpg" />
            </div>
        </div>
    );
}