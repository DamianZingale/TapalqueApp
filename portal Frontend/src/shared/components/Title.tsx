import type { TitleProps } from "../types/PropsGeneralesVerMas"

export const Title : React.FC<TitleProps>= ({text}) => {
    return (
        <h1 className="">
            {text}
        </h1>
    )
}
