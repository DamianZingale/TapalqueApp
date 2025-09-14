import { Form, Button } from "react-bootstrap";
import { useState } from "react";

export const DatosPersonales = () => {
    const [direccion, setDireccion] = useState("Av. San Martín 123");
    const [email, setEmail] = useState("santiago@example.com");


    const nombre = "Santiago";
    const apellido = "Lamot";
    const dni = "12345678";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Dirección:", direccion);
        console.log("Email:", email);
    };
    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-light">
            <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control plaintext readOnly defaultValue={nombre} />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Apellido</Form.Label>
                <Form.Control plaintext readOnly defaultValue={apellido} />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>DNI</Form.Label>
                <Form.Control plaintext readOnly defaultValue={dni} />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>

            <Button variant="secondary" type="submit">
                Guardar cambios
            </Button>
        </form>
    );
};