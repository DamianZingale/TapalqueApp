import { Route, Routes } from "react-router-dom";
import UserDashboard from "./pages/UserDashboard";

export default function UserDashboardRoutes() {
    return (
        <Routes>
            <Route path="/" element={<UserDashboard />} />
        </Routes>
    );
}
