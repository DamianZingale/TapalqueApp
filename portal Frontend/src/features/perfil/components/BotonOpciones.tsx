import { useNavigate } from 'react-router-dom';
import type { IBotonOpciones } from "../../../shared/types/PropsPerfil"

export const BotonOpciones: React.FC<IBotonOpciones> = ({texto, redireccion}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(redireccion); // Ejemplo: '/miApp/Perfil/DatosPersonales'
  };

  return (
    <button className="btn btn-secondary" type="button" onClick={handleClick}>{texto}</button>
  )
}
