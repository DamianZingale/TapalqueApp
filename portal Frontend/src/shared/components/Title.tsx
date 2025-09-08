import type { TittleProps } from "../types/ui/PropsGeneralesVerMas"

export const Title : React.FC<TittleProps>= ({text}) => {
    return (
        <h2 className="text-center my-4">
            {text}
        </h2>
    )
}
