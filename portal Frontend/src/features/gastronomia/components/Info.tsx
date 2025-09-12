import React from 'react';
import type { IRestaurantInfo } from '../types/IrestaurantInfo';
import { WhatsAppButton } from '../../../shared/components/WhatsAppButton';


const mockData: IRestaurantInfo = {
  id: "1",
  name: "Pizzería Giuseppe",
  address: "Av 9 de Julio 500",
  phone: "1234567890",
  email: "giusseppe@gmail.com",
  delivery: true,
  imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
};

export const InfoTest = () => (
  <Info {...mockData} />
);

export const Info: React.FC<IRestaurantInfo> = ({
  name,
  address,
  phone,
  email,
  delivery,
  imageUrl
}) => {
  return (
    <div className="container my-4">
      <div className="card p-3">
        <div className="row align-items-center">
          
          {/* Columna izquierda: datos */}
          <div className="col-md-4">
            <h2>{name}</h2>
            <p>
              📍 {address} <br />
              📞 {phone} <br />
              ✉️ {email} <br />
              🚚 {delivery ? "Delivery disponible" : "Solo en el local"}
            </p>
          </div>

          {/* Columna central: imagen */}
          <div className="col-md-6 text-center">
            <img
              src={imageUrl}
              alt={name}
              className="img-fluid rounded"
              style={{ maxHeight: "250px", objectFit: "cover", width: "100%" }}
            />
          </div>

          {/* Columna derecha: botones*/}

          <div className="col-md-2 d-flex flex-column gap-2">
            <button type="button" className="btn btn-primary">
              📍 Como Llegar
            </button>
            <button type="button" className="btn btn-secondary">
              🍽 Ver Menú
            </button>
            <WhatsAppButton num={phone ?? ''} /> 
          </div>
        </div>
      </div>
    </div>
  );
};
