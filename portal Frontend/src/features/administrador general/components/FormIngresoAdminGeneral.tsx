import React, { useState } from 'react';
import type { FormData, PropsFormIngresoAdminGeneral } from '../types/PropsIngresosNuevosAdminGeneral';


const FormIngresoAdminGeneral: React.FC<PropsFormIngresoAdminGeneral> = ({ tipoCampos, initialData = {}, onSubmit }) => {
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


export default FormIngresoAdminGeneral;
