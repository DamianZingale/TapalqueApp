export const Login = () => {
    
    return (
        <div className="bg-light vh-100 d-flex flex-column">
            <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                <form
                    className="p-4 rounded-4 shadow-sm bg-white"
                    style={{ width: "100%", maxWidth: "400px" }}
                >
                    <div className="text-center mb-4">
                        <h2 className="fw-semibold text-secundary">Ingresar</h2>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control rounded-3"
                            id="email"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control rounded-3"
                            id="password"
                            placeholder="••••••••"
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