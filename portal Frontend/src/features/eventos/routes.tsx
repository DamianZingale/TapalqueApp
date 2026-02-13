import { Routes, Route } from "react-router-dom";
import EventosListPage from "./pages/EventosListPage";
import EventosDetailPage from "./pages/EventosDetailPage";

export default function EventosRoutes() {
    return (
        <Routes>
        <Route path="/" element={<EventosListPage />} />
        <Route path=":id" element={<EventosDetailPage />} />
        </Routes>
    );
}
