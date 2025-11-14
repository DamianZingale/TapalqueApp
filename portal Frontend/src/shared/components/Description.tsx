import type React from "react"
import type { DescriptionProps } from "../types/PropsGeneralesVerMas"

export const Description: React.FC<DescriptionProps> = ({ description }) => {
    return (
        <p>
            {`Sobre nosotros:\n${description}`}
        </p>
    )
}
