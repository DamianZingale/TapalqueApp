import { Form, Button } from "react-bootstrap";
import { useState } from "react";

export const CambiarContraseña = () => {
    const [actual, setActual] = useState("");
    const [nueva, setNueva] = useState("");
    const [repetir, setRepetir] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (nueva !== repetir) {
            alert("Las contraseñas nuevas no coinciden");
            return;
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="p-4 border rounded bg-light">
            <Form.Group className="mb-3">
                <Form.Label>Contraseña actual</Form.Label>
                <Form.Control
                    type="password"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Nueva contraseña</Form.Label>
                <Form.Control
                    type="password"
                    value={nueva}
                    onChange={(e) => setNueva(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Repetir nueva contraseña</Form.Label>
                <Form.Control
                    type="password"
                    value={repetir}
                    onChange={(e) => setRepetir(e.target.value)}
                    required
                />
            </Form.Group>

            <Button variant="secondary" type="submit">
                Actualizar contraseña
            </Button>
        </Form>
    );
};