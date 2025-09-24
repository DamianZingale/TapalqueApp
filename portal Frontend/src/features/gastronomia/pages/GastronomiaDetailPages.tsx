import { useState } from "react";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { Info } from "../components/RestaurantCard";
import { MenuCard } from "../components/MenuCard";
//import { OrderSummaryCard } from "../components/OrderSummaryCard";
import { menuTest } from "../mock/MenuMock";
import { mockData } from "../mock/RestaurantMock";


export default function GastronomiaDetailPage() {
  // Mostrar menú o no
  const [showMenu, setShowMenu] = useState(false);



  

  // Toggle menú
  const toggleMenu = () => setShowMenu(prev => !prev);

  

  
  

  return (
    <div className="container my-4">
      {/* Info del restaurante */}
      <Info onVerMenu={toggleMenu} showMenu={showMenu} {...mockData} />

      {/* Mostrar menú */}
      {showMenu && (
         <MenuCard items={menuTest} />  
        
      )}

     

      {/* Botón WhatsApp */}
      <WhatsAppButton num={mockData.phone ?? ""} />
    </div>
  );
}
