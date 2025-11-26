import type { TitleProps } from "../types/PropsGeneralesVerMas"
import styles from "../../shared/styles/listPages.module.css"

export const Title : React.FC<TitleProps>= ({text}) => {
    return (
        <h1 className={styles.tittle}>
            {text}
        </h1>
    )
}
