import React, { useState } from "react";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { MenuCard } from "../components/MenuCard";
import { Info } from "../components/Info";
import { OrderSummaryCard } from "../components/OrderSummaryCard";
import { menuTest } from "../types/menuTest";
import { mockData } from "../types/InfoTest";

export default function GastronomiaDetailPage() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(prev => !prev);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "120px" }}>
      {/* Card del restaurante */}
      <Info
        {...mockData}
        onVerMenu={toggleMenu}
        showMenu={showMenu}
      />

      {/* Menú */}
      {showMenu && <MenuCard menu={menuTest} />}

      {/* Resumen de pedido */}
      {showMenu && <OrderSummaryCard menu={menuTest} localDelivery={!!mockData.delivery} />}

      {/* Botón WhatsApp fijo */}
      <div style={{ position: "fixed", bottom: "16px", right: "16px", zIndex: 1000 }}>
        <WhatsAppButton num={mockData.phone ?? ""} />
      </div>
    </div>
  );
}
