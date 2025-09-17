import { useState } from "react";
import { useNavigate } from "react-router-dom";


export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // EJEMPLO PARA SOLI INICIO DE SESION
        try {
            //     const res = await axios.post("https://tapalqueapp.com/login", {
            //         email,
            //         password,
            //     });

            //     const token = res.data.token;
            
            //simulo token con rol 3 (admin de hospedaje)
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                "eyJzdWIiOiIxMjMiLCJub21icmUiOiJTYW50aWFnbyIsInJvbCI6MywiZXhwIjoxNzAwMDAwMDAwfQ." +
                "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
            if (token) {
                localStorage.setItem("token", token); // guardo token q recibo del back
                navigate("/"); //voy al incio
            } else {
                alert("Credenciales inválidas");
            }
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
        }
    };

    return (
        <div className="bg-light vh-100 d-flex flex-column">
            <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                <form
                    onSubmit={handleLogin}
                    className="p-4 rounded-4 shadow-sm bg-white"
                    style={{ width: "100%", maxWidth: "400px" }}
                >
                    <div className="text-center mb-4">
                        <h2 className="fw-semibold text-secondary">Ingresar</h2>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control rounded-3"
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
                            className="form-control rounded-3"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-secondary p-1">
                            Ingresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
