import type { TitleProps } from "../types/PropsGeneralesVerMas"

export const Title : React.FC<TitleProps>= ({text}) => {
    return (
        <h1 className="text-center my-4">
            {text}
        </h1>
    )
}
