import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function MainLayout() {
    return (
        <>
            <NavBar />
            <main className="container mt-4">
                <Outlet />
            </main>
            <Footer/>
        </>
    );
}