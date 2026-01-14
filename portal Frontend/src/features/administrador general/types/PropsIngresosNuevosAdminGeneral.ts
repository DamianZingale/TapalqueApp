export type FieldType = 'text' | 'textarea' | 'email' | 'number' | 'checkbox' |'dropdownlist'| 'file'; //tipos de componenes permitidos

export interface ConfiguracionDeCampos {
    name: string;
    label: string;
    type: FieldType;
    multiple?: boolean; // esto para los file(imag) multiples
    options?: { value: string; label: string }[]; //est para los ddl
}

export type FormData = Record<string, string | number | boolean | File | File[]| string[]>;

export interface PropsFormIngresoAdminGeneral {
    tipoCampos: ConfiguracionDeCampos[];
    initialData?: FormData;
    onSubmit: (data: FormData) => void;
}

export const CamposGastronomico: ConfiguracionDeCampos[] = [
    { name: 'name', label: 'Nombre del local', type: 'text' },
    { name: 'address', label: 'Dirección', type: 'text' },
    { name: 'phone', label: 'Teléfono', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'coord', label: 'Coordenadas como llegar', type: 'text' },
    { name: 'image', label: 'Imagen', type: 'file' },
];

export const CampoHospedaje: ConfiguracionDeCampos[] = [
    { name: 'name', label: 'Nombre del hospedaje', type: 'text' },
    { name: 'address', label: 'Ubicación', type: 'text' },
    { name: 'whatapp', label: 'Whatsapp', type: 'text' },
    { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
    { name: 'urlMap', label: 'URL google maps', type: 'text' },
    { name: 'images', label: 'Fotos del lugar', type: 'file', multiple: true },
];

export const CampoComercio: ConfiguracionDeCampos[] = [
    { name: 'name', label: 'Nombre del comercio', type: 'text' },
    { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
    { name: 'horario', label: 'Horarios', type: 'textarea' },
    { name: 'urlMap', label: 'URL google maps', type: 'text' },
    { name: 'whatapp', label: 'Whatsapp', type: 'text' },
    { name: 'images', label: 'Fotos del lugar', type: 'file', multiple: true },
];

export const CampoServicio: ConfiguracionDeCampos[] = [
    { name: 'name', label: 'Nombre del servicio', type: 'text' },
    { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
    { name: 'horario', label: 'Horarios', type: 'textarea' },
    { name: 'whatsapp', label: 'Whatsapp', type: 'text' },
    { name: 'images', label: 'Fotos del lugar', type: 'file', multiple: true },
];

export const CampoUsuario: ConfiguracionDeCampos[] = [
    { name: 'firtname', label: 'Nombre', type: 'text' },
    { name: 'lastname', label: 'Apellido', type: 'text' },
    { name: 'dni', label: 'DNI', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'telefono', label: 'Telefono', type: 'text' },
    {
        name: 'tipoAdmin',
        label: 'Tipo de administrador',
        type: 'dropdownlist',
        options: [
            { value: 'adminGeneral', label: 'Adm. General' },
            { value: 'adminGastro', label: 'Adm. Gastronomico' },
            { value: 'adminHospe', label: 'Adm. de Hospedaje' },
        ],
    },
];

export const CampoTerma: ConfiguracionDeCampos[] = [
    { name: 'titulo', label: 'Nombre', type: 'text' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'horario', label: 'Horarios', type: 'textarea' },
    { name: 'urlMap', label: 'URL google maps', type: 'text' },
    { name: 'whatsapp', label: 'Whatsapp', type: 'text' },
    { name: 'images', label: 'Fotos', type: 'file', multiple: true },
];

export const CampoEvento: ConfiguracionDeCampos[] = [
    { name: 'nombreEvento', label: 'Nombre del Evento', type: 'text' },
    { name: 'lugar', label: 'Lugar', type: 'text' },
    { name: 'horario', label: 'Horario', type: 'text' },
    { name: 'fechaInicio', label: 'Fecha de Inicio', type: 'text' },
    { name: 'fechaFin', label: 'Fecha de Fin (opcional)', type: 'text' },
    { name: 'telefonoContacto', label: 'Teléfono de Contacto', type: 'text' },
    { name: 'nombreContacto', label: 'Nombre de Contacto', type: 'text' },
    { name: 'images', label: 'Imágenes del banner', type: 'file', multiple: true },
];