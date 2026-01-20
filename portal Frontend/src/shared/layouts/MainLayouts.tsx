import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

interface MainLayoutProps {
    children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="container mt-4 flex-grow-1">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
}