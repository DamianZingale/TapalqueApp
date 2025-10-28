import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function MainLayout() {
    return (
        <div className="container">
            <NavBar />
            <main className="">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}