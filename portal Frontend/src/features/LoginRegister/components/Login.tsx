import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../../../services/authService"; 

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

    try {
        const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        "eyJzdWIiOiIxMjMiLCJub21icmUiOiJTYW50aWFnbyIsInJvbCI6MywiZXhwIjoxNzAwMDAwMDAwfQ." +
        "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    if (token) {
        saveToken(token); // guardo token con servicio modular
        navigate("/"); // redirijo al inicio
    } else {
        alert("Credenciales inválidas");
    }
    } catch (err) {
        console.error("Error al iniciar sesión:", err);
    }
};

    return (
        <div className="">
        <div className="">
            <form
            onSubmit={handleLogin}
            className=""
            
            >
            <div className="">
                <h2 className="">Ingresar</h2>
            </div>

            <div className="">
                <label htmlFor="email" className="">Email</label>
                <input
                type="email"
                className=""
                id="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                type="password"
                className=""
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>

            <div className="">
                <button type="submit" className="">
                Ingresar
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};