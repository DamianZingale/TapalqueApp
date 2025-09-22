export interface IBotonOpciones {
    texto: string;
    redireccion: string;
}

export interface PropsNotificacion {
    id: string;
    asunto: string;
    fecha: string;
    descripcion: string;
}

export interface PropsListado {
    id: string;
    encabezado: string;
    titulo: string;
    pie: string;
    textButton: string;
    handleButton:(id:string) => void;
}

export interface PropsDatosPersonales {
    nombre: string;
    apellido: string;
    dni: string;
    direccion: string;
    email: string;
    setDireccion: (value: string) => void;
    setEmail: (value: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}