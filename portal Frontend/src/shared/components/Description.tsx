import type React from "react"
import type { DescriptionProps } from "../types/PropsGeneralesVerMas"
import styles from "../../shared/components/styles/termas.module.css"

export const Description: React.FC<DescriptionProps> = ({ description }) => {
    return (
        <p className={styles.descripcion}>
            {`Sobre nosotros:\n${description}`}
        </p>
    )
}
