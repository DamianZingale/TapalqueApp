import type React from "react"
import type { DescriptionProps } from "../types/ui/PropsGeneralesVerMas"

export const Description: React.FC<DescriptionProps> = ({ description }) => {
    return (
        <p
            style={{
                whiteSpace: "pre-line",
                textAlign: "justify",
                fontSize: "1.1rem",
                lineHeight: "1.6",
                color: "#444",
                fontWeight: 400,
                marginBottom: "1.5rem",
            }}
        >
            {`Sobre nosotros:\n${description}`}
        </p>
    )
}
