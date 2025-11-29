export const Register = () => {
    return (
        <div className="">
            <div className="">
                <form
                    className=""
                    
                >
                    <div className="">
                        <h2 className="">Registrarse</h2>
                    </div>

                    <div className="">
                        <label htmlFor="name" className="">Nombre completo</label>
                        <input
                            type="text"
                            className=""
                            id="name"
                            placeholder="Ingrese su nombre"
                        />
                    </div>

                    <div className="">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control rounded-3"
                            id="email"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <div className="">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control rounded-3"
                            id="password"
                            placeholder="Ingrese una contraseña"
                        />
                    </div>

                    <div className="">
                        <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                        <input
                            type="password"
                            className="form-control rounded-3"
                            id="confirmPassword"
                            placeholder="Repita la contraseña"
                        />
                    </div>

                    <div className="">
                        <button type="submit" className="">
                            Crear cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
