import React, { useState } from 'react';
import type { FormData, PropsFormIngresoAdminGeneral } from '../types/PropsIngresosNuevosAdminGeneral';


export const FormIngresoEditar: React.FC<PropsFormIngresoAdminGeneral> = ({ tipoCampos, initialData = {}, onSubmit }) => {
    const [formData, setFormData] = useState<FormData>(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, files, value, checked, multiple } = e.target;

        if (type === 'file') {
            if (files) {
                setFormData({
                    ...formData,
                    [name]: multiple ? Array.from(files) : files[0],
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="">
            {tipoCampos.map((field) => (
                <div className="mb-3" key={field.name}>
                    <label htmlFor={field.name} className="form-label">
                        {field.label}
                    </label>
                    {field.type === 'file' ? (
                        <input
                            className=""
                            type="file"
                            name={field.name}
                            id={field.name}
                            multiple={field.multiple}
                            onChange={handleChange}
                        />
                    ) : field.type === 'textarea' ? (
                        <textarea
                            className=""
                            name={field.name}
                            id={field.name}
                            value={String(formData[field.name] ?? '')}
                            onChange={(e) =>
                                setFormData({ ...formData, [field.name]: e.target.value })
                            }
                        />
                    ) : field.type === 'dropdownlist' ? (
                        <select
                            className="form-select"
                            name={field.name}
                            id={field.name}
                            value={String(formData[field.name] ?? '')}
                            onChange={(e) =>
                                setFormData({ ...formData, [field.name]: e.target.value })
                            }
                        >
                            <option value="">Seleccione una opción</option>
                            {field.options?.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            className=""
                            type={field.type}
                            name={field.name}
                            id={field.name}
                            value={String(formData[field.name] ?? '')}
                            onChange={handleChange}
                        />
                    )}
                </div>
            ))}
            <div className=''>
                <button type="submit" className="">
                    Guardar
                </button>
            </div>
        </form>
    );
};