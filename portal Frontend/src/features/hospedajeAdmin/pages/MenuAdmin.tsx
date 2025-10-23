import { Link } from "react-router-dom";

export const MenuAdmin = () => {
    return (
        <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Administración de Hospedajes</h1>

        <div className="flex flex-col gap-4">
            <Link
                to="edit/1"
                className="bg-blue-600 text-black px-4 py-2 rounded shadow"
            >
                Editar hospedajes
            </Link>

            <Link
                to="reservas"
                className="bg-green-600 text-black px-4 py-2 rounded shadow"
            >
                Ver reservas
            </Link>
            </div>

        </div>
    );
};
