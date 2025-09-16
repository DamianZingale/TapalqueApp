import type { MercadoPagoButtonProps } from "../types/PropsButtonMercadoPago";

export const ButtonMercadoPago: React.FC<MercadoPagoButtonProps> = ({ preferenceId }) => {
    const handleClick = () => {
        const script = document.createElement("script");
        script.src = "https://www.mercadopago.com.ar/integrations/v2/web-payment-checkout.js";
        script.type = "text/javascript";
        script.setAttribute("data-preference-id", preferenceId);
        document.body.appendChild(script);
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px"
            }}
        >
            <button
                onClick={handleClick}
                style={{
                    backgroundColor: "#009EE3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >
                <img
                    src="https://img.icons8.com/?size=256&id=nTLVtpxsNPaz&format=png"
                    alt="Mercado Pago"
                    style={{ height: "24px" }}
                />
                Confirmar y pagar
            </button>
        </div>
    );
};