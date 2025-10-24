import { HotelesPage } from "./pages/HotelesPage"
import { HotelFormPage } from "./pages/HotelFormPage"

const AdminHospedajesRoutes = [
    { path: "", element: <HotelesPage /> },
    { path: "nuevo", element: <HotelFormPage /> },
    { path: "editar/:id", element: <HotelFormPage /> }, 
]

export default AdminHospedajesRoutes